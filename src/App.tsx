import "./App.css";
import { Button, CircularProgress, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useState, useEffect, useRef, useCallback } from "react";
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
  const searchParams = new URLSearchParams(document.location.search)
  const [stream, setStream] = useState<MediaStream | null>(null);


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
      // setChoosenCam(tabCams[0].deviceId)
      // console.log(tabCams[0].deviceId)

    });
  }, [])

  useEffect(()=>{
    if(webcams) setChoosenCam(webcams[0].deviceId)
    
  }, [webcams])

  useEffect(()=>{
    console.log("test with " + choosenCam)
    
  }, [choosenCam])


  //stream de la webcam
  useEffect(() => {
    const constraints = {
      video: {
        deviceId: { exact: choosenCam }
      }
    };

    if (isStreaming && !conditionRespected && videoRef.current) {
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        setStream(stream);

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
      // console.log(videoRef.current)
      //  image.current = videoRef.current?.getScreenshot();
      //   console.log(image.current)
    }


  };

  useEffect(() => {
    if (!isStreaming) return;
    intervalRef.current = setInterval(() => {
      captureImage();
      checkVideo();

    }, 500);

    // Nettoyer l'intervalle lorsque le composant est démonté
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isStreaming]);

  // useEffect(() => {
  //   console.log("get into useEffect with this image :", image)
  //   if (imageForAPIRef.current === image && image && isStreaming) {
  //     checkVideo();
  //   }
  // }, [image, isStreaming])

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
    let urlValue = searchParams.get('URL') ?? "";
    let keyValue = searchParams.get('KEY') ?? "";
    let tagValue = searchParams.get('TAG') ?? "";
    let temperature = parseFloat(searchParams.get('TEMP') ?? "75");


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
        }
      });
    }
  };

  if (conditionRespected) {
    document.body.style.backgroundColor = "rgba(181, 251, 179, 0.87)";

  } else {
    document.body.style.backgroundColor = "";
  }

  // return (
  //   <>
  //     <Webcam
  //       audio={false}
  //       height={720}
  //       width={1280}
  //       ref={videoRef}

  //     />
  //     <img src={image.current!} hidden={!showCam}></img>
  //     {!isStreaming ? (
  //       <>
  //         <Header />
  //         <Form
  //           urlValue={urlValue}
  //           handleUrlChange={handleUrlChange}
  //           keyValue={keyValue}
  //           handleKeyChange={handleKeyChange}
  //           tagValue={tagValue}
  //           handleTagChange={handleTagChange}
  //           temperature={temperature}
  //           handleChange={handleChange}
  //           nextStepValue={nextStepValue}
  //           handleNextStepChange={handleNextStepChange}
  //           setIsStreaming={setIsStreaming}
  //         />
  //       </>
  //     ) : (
  //       <>
  //         <Button
  //           variant="contained"
  //           sx={{
  //             backgroundColor: "#7bbaff",
  //             fontWeight: "bold",
  //             mt: "2rem",
  //             mr: "1rem",
  //           }}
  //           onClick={backRoot}
  //         >
  //           back
  //         </Button>
  //         <Button
  //           variant="contained"
  //           sx={{
  //             backgroundColor: "#7bbaff",
  //             fontWeight: "bold",
  //             mt: "2rem",
  //           }}
  //           onClick={OpenCamera}
  //         >
  //           📸
  //         </Button>

  //         <Select
  //           labelId="demo-simple-select-label"
  //           id="demo-simple-select"
  //           value={choosenCam}
  //           label="Webcam"
  //           onChange={handleSelectCamChange}
  //         >
  //           {webcams?.map((camInfo) => {
  //             return <MenuItem key={camInfo.deviceId} value={camInfo.deviceId}>{camInfo.label}</MenuItem>
  //           })}

  //         </Select>
  //       </>
  //     )}

  //     {image.current && isStreaming ? (
  //       <>
  //         {conditionRespected ? (
  //           <h1>
  //             <a href={nextStepValue}>
  //               <Button
  //                 variant="contained"
  //                 sx={{
  //                   backgroundColor: "#7bbaff",
  //                   fontWeight: "bold",
  //                 }}
  //               >
  //                 Next
  //               </Button>
  //               <br></br>
  //               <br></br>
  //             </a>
  //             ✅
  //           </h1>
  //         ) : (
  //           <>
  //             <h1>❌</h1>
  //           </>
  //         )}
  //       </>
  //     ) : (
  //       <p></p>
  //     )}
  //   </>
  // );

  return (
    <div>
      <Webcam
        audio={false}
        height={720}
        width={1280}
        ref={videoRef}

      />
      {choosenCam !== undefined &&
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={choosenCam}
          label="Webcam"
          onChange={handleSelectCamChange}
        >
          {webcams?.map((camInfo) => {
            return <MenuItem key={camInfo.deviceId} value={camInfo.deviceId}>{camInfo.label}</MenuItem>
          })}

        </Select>
      }
      {conditionRespected ? (
        <h1>
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
            <br></br>
            <br></br>
          </a>
          ✅
        </h1>
      ) : (
        <>
          <h1>❌</h1>
          <CircularProgress />
        </>
      )}
    </div>
  );
}

export default App;
