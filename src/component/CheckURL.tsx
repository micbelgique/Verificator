
import { Button, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";


interface Prediction {
  probability: number;
  tagId: string;
  tagName: string;
}

function CheckURL() {
  const searchParams = new URLSearchParams(document.location.search)
  const [isStreaming, setIsStreaming] = useState(true);
  const [conditionRespected, setConditionRespected] = useState(false);
  const [showCam, setShowCam] = useState(false);
  const videoRef = useRef<Webcam>(null);
  const image = useRef<string | null | undefined>(null)
  const intervalRef = useRef<number | undefined>(undefined);
  const [webcams, setWebCams] = useState<MediaDeviceInfo[]>();
  const [choosenCam, setChoosenCam] = useState<string>();

  //initialisation liste des camera
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((result) => {
      const tabCams: MediaDeviceInfo[] = result.filter((infos) => infos.kind === "videoinput")
      setWebCams(tabCams)
      setChoosenCam(tabCams[0].deviceId)
    });
  }, [])

  //stream de la webcam
  useEffect(() => {
    const constraints = {
      video: {
        deviceId: { exact: choosenCam }
      }
    };

    if (isStreaming && videoRef.current) {
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {

        videoRef.current!.video!.srcObject = stream;

      });
    }
  }, [isStreaming, choosenCam]);

  // Méthode pour capturer une image depuis le flux vidéo
  const captureImage = () => {

    const video = videoRef.current?.video!

    const canvas: HTMLCanvasElement = document.createElement('canvas');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context != null) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataURL = canvas.toDataURL("image/png");
      image.current = imageDataURL

    }
  };

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

  //fonctions pour récupérer les valeurs des inputs
  // const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   setUrlValue(event.target.value);
  // };
  // const handleKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   setKeyValue(event.target.value);
  // };
  // const handleTagChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   setTagValue(event.target.value);
  // };
  // const handleNextStepChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   setNextStepValue(event.target.value);
  // };
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
    let urlValue = searchParams.get('URL') ?? "";
    let keyValue = searchParams.get('KEY') ?? "";
    let tagValue = searchParams.get('TAG') ?? "";
    let temperature = parseFloat(searchParams.get('TEMP') ?? "75");
    let foundGoodPrediction = false;

    if (image.current && conditionRespected === false) {
      console.log(urlValue)
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
          prediction.tagName == tagValue
        ) {
          setConditionRespected(true);
          foundGoodPrediction=true
        }
        if (!foundGoodPrediction) {
          setConditionRespected(false);
        }
      });
    }
  };




  return (
    <div>
      {choosenCam !== undefined &&
        <>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#7bbaff",
              fontWeight: "bold",
            }}
            onClick={toggleCameraVisibility}
          >
            🎥
          </Button>
          <br/>
          <Webcam
            audio={false}
            height={720}
            width={1280}
            ref={videoRef}
            className={showCam ? "" : "hidden-video"} />

          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={choosenCam}
            label="Webcam"
            onChange={handleSelectCamChange}
          >
            {webcams?.map((camInfo) => {
              return <MenuItem key={camInfo.deviceId} value={camInfo.deviceId}>{camInfo.label}</MenuItem>;
            })}

          </Select></>
      }
      {conditionRespected ? (
        <h1>
          <iframe id="externalWebsiteFrame"
            title="Redirection"
            src={searchParams.get('REDIRECT') ?? ""}>
          </iframe>
          <br />
          <a href={searchParams.get('REDIRECT') ?? ""}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#7bbaff",
                fontWeight: "bold",
              }}
            >
              Next
            </Button>
          </a>
        </h1>
      ) : (
        <>
          <h2>⚠️{searchParams.get('TAG') ? "Aucun(e) " + searchParams.get('TAG') + " détecté(e)(s)" : "Insérez un tag dans l'URL"}
            { }⚠️</h2>
        </>
      )}
    </div>
  );
}

export default CheckURL;
