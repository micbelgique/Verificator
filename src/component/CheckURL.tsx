import { Button, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";

import CameraIcon from "@mui/icons-material/Camera";
import SettingsIcon from "@mui/icons-material/Settings";

interface Prediction {
  probability: number;
  tagId: string;
  tagName: string;
}

//fonction pour recuperer un tableau de mot séparé par un ;
const splitString = (splitableString: string): string[] => {
  if (splitableString === "") return [];
  if (!splitableString.includes(";")) return [splitableString];
  return splitableString.split(";");
};

const decodeListOfUrl = (urls: string[]): string[] => {
  return urls.map((url) => decodeURIComponent(url));
};

const splitAndDecodeURls = (urlString: string): string[] => {
  return decodeListOfUrl(splitString(urlString));
};
/*
COMPOSANT
*/
function CheckURL() {
  const searchParams = new URLSearchParams(document.location.search);
  const [urlValue] = useState(
    decodeURIComponent(searchParams.get("URL") ?? "")
  );
  const [keyValue] = useState(searchParams.get("KEY") ?? "");
  const [tagValue] = useState<string[]>(
    splitString(searchParams.get("TAG") ?? "")
  );
  const [temperature] = useState(parseFloat(searchParams.get("TEMP") ?? "75"));
  const [redirect] = useState<string[]>(
    splitAndDecodeURls(searchParams.get("REDIRECT") ?? "")
  );
  const [isStreaming, setIsStreaming] = useState(true);
  const [conditionRespected, setConditionRespected] = useState(false);
  const [showCam, setShowCam] = useState(false);
  const [paramshowCam, setParamShowCam] = useState(false);
  const videoRef = useRef<Webcam>(null);
  const image = useRef<string | null | undefined>(null);
  const intervalRef = useRef<number | undefined>(undefined);
  const [webcams, setWebCams] = useState<MediaDeviceInfo[]>();
  let [choosenCam, setChoosenCam] = useState<string>();

  const [currentTagIndexDetected, setCurrentTagIndexDetected] =
    useState<number>();

  //initialisation liste des cameras
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((result) => {
      const tabCams: MediaDeviceInfo[] = result.filter(
        (infos) => infos.kind === "videoinput"
      );
      setWebCams(tabCams);
      setChoosenCam(tabCams[0].deviceId);
    });
  }, []);

  //stream de la webcam
  useEffect(() => {
    const constraints = {
      video: {
        deviceId: { exact: choosenCam },
      },
    };

    if (isStreaming && videoRef.current) {
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        videoRef.current!.video!.srcObject = stream;
      });
    }
  }, [isStreaming, choosenCam]);

  // Méthode pour capturer une image depuis le flux vidéo
  const captureImage = () => {
    const video = videoRef.current?.video!;
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (context != null) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataURL = canvas.toDataURL("image/png");
      image.current = imageDataURL;
    }
  };

  //useEffect de detection
  useEffect(() => {
    if (!isStreaming) return;
    intervalRef.current = setInterval(() => {
      captureImage();
      checkVideo();
    }, 2000);

    // Nettoyer l'intervalle lorsque le composant est démonté
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isStreaming]);

  const handleSelectCamChange = (event: SelectChangeEvent) => {
    setChoosenCam(event.target.value as string);
  };
  const toggleCameraVisibility = () => {
    setShowCam((prevShowCam) => !prevShowCam);
  };

  //fonction pour convertir l'image en blob
  const dataUrlToFile = (dataUrl: string) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  //fonction pour envoyer l'image à l'API
  const checkVideo = async () => {
    setIsStreaming(true);

    let foundGoodPrediction = false;

    if (image.current && conditionRespected === false) {
      console.log(urlValue);
      const response = await fetch(urlValue, {
        method: "Post",
        headers: {
          "Prediction-Key": keyValue,
          "Content-Type": "application/octet-stream",
        },
        body: dataUrlToFile(image.current!),
      });
      const data = await response.json();

      data.predictions.forEach((prediction: Prediction) => {
        if (
          prediction.probability > temperature / 100 &&
          tagValue.includes(prediction.tagName)
        ) {
          let indexOfTag = tagValue.indexOf(prediction.tagName);
          if (indexOfTag !== -1) {
            setCurrentTagIndexDetected(indexOfTag);
            setConditionRespected(true);
            foundGoodPrediction = true;
          }
        }
        if (!foundGoodPrediction) {
          setConditionRespected(false);
        }
      });
    }
  };

  if (!conditionRespected) {
    document.body.style.backgroundColor = "#E74C3C";
  } else {
    document.body.style.backgroundColor = "";
  }

  const showsettings = () => {
    setParamShowCam(!paramshowCam);
  };
  return (
    <>
      <Button
        variant="contained"
        sx={{
          position: "absolute",
          top: "50px",
          right: "50px",
          zIndex: "1000",
          width: "2rem",
          height: "3.4rem",
          backgroundColor: "#f1f1f1",
          color: "black",
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "black",
            color: "white",
          },
        }}
        onClick={showsettings}
      >
        <SettingsIcon />
      </Button>
      {choosenCam !== undefined && (
        <>
          <div
            style={{
             
              display: paramshowCam ? "block" : "none",
            }}
          >
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={choosenCam}
              label="Webcam"
              onChange={handleSelectCamChange}
              sx={{
                minWidth: "200px",
                margin: "10px",
                backgroundColor: "#f1f1f1",
                borderRadius: "5px", //
              }}
            >
              {webcams?.map((camInfo) => {
                return (
                  <MenuItem key={camInfo.deviceId} value={camInfo.deviceId}>
                    {camInfo.label}
                  </MenuItem>
                );
              })}
            </Select>
            <Button
              variant="contained"
              sx={{
                ml: "1rem",
                width: "2rem",
                height: "3.4rem",
                backgroundColor: "#f1f1f1",
                color: "black",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "black",
                  color: "white",
                },
              }}
              onClick={toggleCameraVisibility}
            >
              <CameraIcon />
            </Button>

            <br />
            <Webcam
              audio={false}
              height={360}
              width={740}
              ref={videoRef}
              className={showCam ? "" : "hidden-video"}
            />
          </div>
        </>
      )}

      {conditionRespected ? (
        <h1>
          <iframe
            id="externalWebsiteFrame"
            title="Redirection"
            src={redirect[currentTagIndexDetected ?? 0] + "?autoplay=1&mute=1"}
            style={{
              width: "50rem", // Set the desired width, e.g., "500px", "50%", etc.
              height: "25rem", // Set the desired height
            }}
            allow="autoplay"
          ></iframe>
          <br />
          <a href={redirect[currentTagIndexDetected ?? 0]}>
            <Button variant="contained">Next</Button>
          </a>
        </h1>
      ) : (
        <>
          <h2>{tagValue ? "Nothing detected" : "Put a tag in the URL"}</h2>
        </>
      )}
    </>
  );
}

export default CheckURL;
