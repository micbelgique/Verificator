import { TextField, Button, Container, Slider, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ChangeEvent } from "react";

interface FormProps {
  urlValue: string;
  handleUrlChange: (event: ChangeEvent<HTMLInputElement>) => void;
  keyValue: string;
  handleKeyChange: (event: ChangeEvent<HTMLInputElement>) => void;
  tagValue: string;
  handleTagChange: (event: ChangeEvent<HTMLInputElement>) => void;
  temperature: number;
  handleChange: (_event: Event, newValue: number | number[]) => void;
  nextStepValue: string;
  handleNextStepChange: (event: ChangeEvent<HTMLInputElement>) => void;
  // checkVideo: () => void;
  setIsStreaming: (value : boolean) => void;
}

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

function Form({
  urlValue,
  handleUrlChange,
  keyValue,
  handleKeyChange,
  tagValue,
  handleTagChange,
  temperature,
  handleChange,
  nextStepValue,
  handleNextStepChange,
  setIsStreaming,
}: FormProps) {
  return (
    <Container sx={{ display: "flex", flexDirection: "column", mt: "6rem" }}>
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

        <Typography sx={{ color: "currentColor", padding: "8px 0 5px", m: "0" }}>
          Confidence: {temperature}
        </Typography>

        <Slider
          sx={{
            color: "#7bbaff",
          }}
          aria-label="Temperature"
          defaultValue={30}
          value={temperature}
          onChange={handleChange}
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
          onClick={() => setIsStreaming(true)}
        >
          Check
        </Button>
      </ThemeProvider>
    </Container>
  );
}

export default Form;
