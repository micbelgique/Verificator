import micLogo from "/MIC.svg";
import "./App.css";
import {
  TextField,
  Button,
  Container,
  Slider,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { ChangeEvent } from "react";

interface Prediction {
  probability: number;
  tagId: string;
  tagName: string;
}

//theme
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
  },
});

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [urlValue, setUrlValue] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [tagValue, setTagValue] = useState("");
  const [nextStepValue, setNextStepValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conditionRespected, setConditionRespected] = useState(false);
  const [showCam, setShowCam] = useState(false);
  const [temperature, setTemperature] = useState(30);

  const handleChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setTemperature(newValue);
    }
  };
  //stream de la webcam
  useEffect(() => {
    const constraints = { video: true };
    if (isStreaming && !conditionRespected) {
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        setStream(stream);
      });
    }
  }, [isStreaming]);

  useEffect(() => {
    if (stream) {
      const interval = setInterval(() => {
        const video = document.createElement("video");
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext("2d")?.drawImage(video, 0, 0);
          setImage(canvas.toDataURL("image/png"));
        };
      }, 24);

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
    setImage(null);
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
        body: dataUrlToFile(image),
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
      <>
        {!isStreaming ? (
          <>
            <header>
              <a href="https://www.mic-belgique.be/" target="_blank">
                <img src={micLogo} className="logo" alt="Vite logo" />
              </a>
            </header>
            <Container
              sx={{ display: "flex", flexDirection: "column", mt: "6rem" }}
            >
              <ThemeProvider theme={theme}>
                <TextField
                  fullWidth
                  id="urlField"
                  label="Url"
                  variant="standard"
                  value={urlValue}
                  onChange={handleUrlChange}
                />
                <TextField
                  fullWidth
                  id="keyField"
                  label="Key"
                  variant="standard"
                  value={keyValue}
                  onChange={handleKeyChange}
                />
                <TextField
                  id="tagField"
                  label="Tag"
                  variant="standard"
                  value={tagValue}
                  onChange={handleTagChange}
                />

                <Typography
                  sx={{ color: "currentColor", padding: "8px 0 5px", m: "0" }}
                >
                  Confidence : {temperature}
                </Typography>

                <Slider
                  sx={{
                    color: "#7bbaff",
                  }}
                  aria-label="Temperature"
                  defaultValue={30}
                  value={temperature}
                  onChange={handleChange}
                  // valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={0}
                  max={100}
                />

                <TextField
                  id="nextStep"
                  label="Next Step"
                  variant="standard"
                  value={nextStepValue}
                  onChange={handleNextStepChange}
                />
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#7bbaff",
                    fontWeight: "bold",
                    mt: "2rem",
                  }}
                  onClick={checkVideo}
                >
                  Check
                </Button>
              </ThemeProvider>
            </Container>
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
                {showCam ? <img src={image} alt="camera capture" /> : <p></p>}
              </>
            )}
          </>
        ) : (
          <p></p>
        )}
      </>
    </>
  );
}

export default App;
