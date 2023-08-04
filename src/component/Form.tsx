import {
  TextField,
  Button,
  Container,
  Slider,
  Typography,
} from "@mui/material";

import { useState } from "react";

function Form() {
  const [temperature, setTemperature] = useState<number>(75);
  const [urlField, setUrlField] = useState<string>();
  const [keyField, setKeyField] = useState<string>();
  const [tagField, setTagField] = useState<string>();
  const [nextStepField, setNextStepField] = useState<string>();

  const handleButtonClick = () => {
    // Create the URL with form data as parameters
    if (!urlField || !keyField || !tagField || !nextStepField) return;
    const url = new URL(
      "http://localhost:5173/setting"
    );
    url.searchParams.set("URL", encodeURIComponent(urlField));
    url.searchParams.set("KEY", keyField);
    url.searchParams.set("TAG", tagField);
    url.searchParams.set("TEMP", temperature.toString());
    url.searchParams.set("REDIRECT", encodeURIComponent(nextStepField));

    console.log(url.toString());

    // Redirect to the new URL
    window.location.href = url.toString();
  };

  return (
    <Container sx={{ display: "flex", flexDirection: "column", mt: "6rem" }}>
      <TextField
        fullWidth
        id="urlField"
        label="Url"
        variant="standard"
        onChange={(e) => setUrlField(e.target.value)}
        required
      />
      <TextField
        fullWidth
        id="keyField"
        label="Key"
        variant="standard"
        onChange={(e) => setKeyField(e.target.value)}
        required
      />
      <TextField
        id="tagField"
        label="Tag"
        variant="standard"
        onChange={(e) => setTagField(e.target.value)}
        required
      />

      <Typography sx={{ color: "currentColor", padding: "8px 0 5px", m: "0" }}>
        Confidence:{temperature}
      </Typography>

      <Slider
        sx={{
          color: "#7bbaff",
        }}
        aria-label="Temperature"
        defaultValue={30}
        step={1}
        marks
        min={0}
        max={100}
        onChange={(_e, newValue) => setTemperature(newValue as number)}
      />

      <TextField
        id="nextStep"
        label="Next Step"
        variant="standard"
        onChange={(e) => setNextStepField(e.target.value)}
      />
      <Button
        variant="contained"
        sx={{
          backgroundColor: "#7bbaff",
          fontWeight: "bold",
          mt: "2rem",
        }}
        onClick={handleButtonClick}
      >
        Submit
      </Button>
    </Container>
  );
}

export default Form;
