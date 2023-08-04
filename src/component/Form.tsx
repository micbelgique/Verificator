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
  const [urlField, setUrlField] = useState<string>("");
  const [keyField, setKeyField] = useState<string>("");
  const [formData, setFormData] = useState<{ tag: string; nextStep: string }[]>(
    [{ tag: "", nextStep: "" }]
  );

  const handleButtonClick = () => {
    if (!urlField || !keyField) return;
    const url = new URL("http://localhost:5173/setting");
    url.searchParams.set("URL", encodeURIComponent(urlField));
    url.searchParams.set("KEY", keyField);
    url.searchParams.set("TAG", formData.map((data) => data.tag).join(";"));
    url.searchParams.set(
      "NEXT_STEP",
      formData.map((data) =>  encodeURIComponent(data.nextStep)).join(";")
    );
    url.searchParams.set("TEMP", temperature.toString());

    console.log(url.toString());

    window.location.href = url.toString();
  };

  const handleAddInput = () => {
    setFormData([...formData, { tag: "", nextStep: "" }]);
  };

  const handleTagChange = (index: number, value: string) => {
    const updatedFormData = [...formData];
    updatedFormData[index].tag = value;
    setFormData(updatedFormData);
  };

  const handleNextStepChange = (index: number, value: string) => {
    const updatedFormData = [...formData];
    updatedFormData[index].nextStep = value;
    setFormData(updatedFormData);
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

      {formData.map((data, index) => (
        <div key={index} style={{ display: "flex", alignItems: "center" }}>
          <TextField
            id={`tagField_${index}`}
            label="Tag"
            variant="standard"
            value={data.tag}
            onChange={(e) => handleTagChange(index, e.target.value)}
            required
            style={{ marginRight: "1rem" }}
          />

          <TextField
            id={`nextStep_${index}`}
            label="Next Step"
            variant="standard"
            value={data.nextStep}
            onChange={(e) => handleNextStepChange(index, e.target.value)}
          />

          {/* "+" button to add more "Tag" and "Next Step" fields */}
          {index === formData.length - 1 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddInput}
              sx={{ mt: "1rem" }}
            >
              +
            </Button>
          )}
        </div>
      ))}

      <Typography sx={{ color: "currentColor", padding: "8px 0 5px", m: "0" }}>
        Confidence: {temperature}
      </Typography>

      <Slider
        sx={{
          color: "#7bbaff",
        }}
        aria-label="Temperature"
        defaultValue={75}
        step={1}
        marks
        min={0}
        max={100}
        onChange={(_e, newValue) => setTemperature(newValue as number)}
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
