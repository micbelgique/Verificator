import "./App.css";
import { Button } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { ChangeEvent } from "react";
import Header from "./component/Header";
import Form from "./component/Form";
import Webcam from "react-webcam";

interface Prediction {
  probability: number;
  tagId: string;
  tagName: string;
}

function App() {
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [urlValue, setUrlValue] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [tagValue, setTagValue] = useState("");
  const [nextStepValue, setNextStepValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conditionRespected, setConditionRespected] = useState(false);
  const [showCam, setShowCam] = useState(false);
  const [temperature, setTemperature] = useState(30);
  const videoRef = useRef<Webcam>(null);
  const image = useRef<string | null>(null); 
  

  const handleChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setTemperature(newValue);
    }
  };

  //stream de la webcam
  useEffect(() => {
    const constraints = { video: true };
    console.log(videoRef.current);
    if (isStreaming && !conditionRespected && videoRef.current) {
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        setStream(stream);

        videoRef.current!.video!.srcObject = stream;
      });
    }
  }, [isStreaming]);

  useEffect(() => {
    if (stream) {
      const interval = setInterval(() => {
        const video = videoRef.current?.video;
        if (!video) return;
        video.onloadedmetadata = () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext("2d")?.drawImage(video, 0, 0);
          image.current=canvas.toDataURL("image/png");
        };
      }, 500);

      return () => clearInterval(interval);
    }
  }, [stream]);

  useEffect(() => {
    if (image && isStreaming) {
      checkVideo();
    }
  }, [image]);

  //fonctions pour récupérer les valeurs des inputs
  const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUrlValue(event.target.value);
  };
  const handleKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    setKeyValue(event.target.value);
  };
  const handleTagChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTagValue(event.target.value);
  };
  const handleNextStepChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNextStepValue(event.target.value);
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

  const OpenCamera = () => {
    if (showCam) {
      setShowCam(false);
    } else {
      setShowCam(true);
    }
  };

  //fonction pour revenir au menu
  const backRoot = () => {
    setIsStreaming(false);
    image.current = null;
    setConditionRespected(false);
    setShowCam(false);
  };

  //fonction pour envoyer l'image à l'API
  const checkVideo = async () => {
    setIsStreaming(true);
    if (image && conditionRespected == false) {
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
        } else {
        }
      });
    }
  };

  if (conditionRespected) {
    document.body.style.backgroundColor = "rgba(181, 251, 179, 0.87)";
  } else {
    document.body.style.backgroundColor = "";
  }

  return (
    <>
      <Webcam
        audio={false}
        height={720}
        width={1280}
        ref={videoRef}
        hidden={!showCam}
      />
      {!isStreaming ? (
        <>
          <Header />
          <Form
            urlValue={urlValue}
            handleUrlChange={handleUrlChange}
            keyValue={keyValue}
            handleKeyChange={handleKeyChange}
            tagValue={tagValue}
            handleTagChange={handleTagChange}
            temperature={temperature}
            handleChange={handleChange}
            nextStepValue={nextStepValue}
            handleNextStepChange={handleNextStepChange}
            checkVideo={checkVideo}
          />
        </>
      ) : (
        <>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#7bbaff",
              fontWeight: "bold",
              mt: "2rem",
              mr: "1rem",
            }}
            onClick={backRoot}
          >
            back
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#7bbaff",
              fontWeight: "bold",
              mt: "2rem",
            }}
            onClick={OpenCamera}
          >
            📸
          </Button>
        </>
      )}

      {image && isStreaming ? (
        <>
          {conditionRespected ? (
            <h1>
              <a href={nextStepValue}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#7bbaff",
                    fontWeight: "bold",
                  }}
                >
                  Next
                </Button>
                <br></br>
                <br></br>
              </a>
              ✅
            </h1>
          ) : (
            <>
              <h1>❌</h1>
            </>
          )}
        </>
      ) : (
        <p></p>
      )}
    </>
  );
}

export default App;
