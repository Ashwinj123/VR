import { useState } from "react";

function App() {
  const [modelImage, setModelImage] = useState(null);
  const [garmentImage, setGarmentImage] = useState(null);
  const [imagePreview, setImagePreview] = useState({
    model: null,
    garment: null,
  });
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("tops"); // Default category

  const API_KEY = "fa-MpHCVDoCsGor-CTDI2d48FMxRESc3F560y6IU";
  const BASE_URL = "https://api.fashn.ai/v1";

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview((prev) => ({ ...prev, [type]: imageUrl }));

      if (type === "model") {
        setModelImage(file);
      } else {
        setGarmentImage(file);
      }
    }
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ashwin"); // Set up in Cloudinary
    formData.append("cloud", "drhcswu5n");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/drhcswu5n/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  };

  const generateTryOn = async () => {
    if (!modelImage || !garmentImage) {
      alert("Please upload both images.");
      return;
    }

    setLoading(true);
    try {
      const uploadedModelUrl = await uploadImageToCloudinary(modelImage);
      const uploadedGarmentUrl = await uploadImageToCloudinary(garmentImage);

      console.log("Uploaded Model Image:", uploadedModelUrl);
      console.log("Uploaded Garment Image:", uploadedGarmentUrl);
      console.log("Selected Category:", category);

      const requestBody = {
        model_image: uploadedModelUrl,
        garment_image: uploadedGarmentUrl,
        category: category, // Send selected category
      };

      console.log("Request Body:", requestBody);

      const response = await fetch(`${BASE_URL}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(`API Error: ${data.message || "Unknown error"}`);
      }

      const predictionId = data.id;
      if (!predictionId) throw new Error("Failed to start the try-on process");

      console.log("Prediction started, ID:", predictionId);

      const checkStatus = async () => {
        const statusResponse = await fetch(
          `${BASE_URL}/status/${predictionId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${API_KEY}` },
          }
        );

        const statusData = await statusResponse.json();
        console.log("Prediction status:", statusData.status);

        if (statusData.status === "completed") {
          setGeneratedImage(statusData.output[0]); // Display generated image
          setLoading(false);
        } else if (
          ["starting", "in_queue", "processing"].includes(statusData.status)
        ) {
          setTimeout(checkStatus, 3000); // Poll every 3 seconds
        } else {
          console.error("Prediction failed:", statusData.error);
          setLoading(false);
        }
      };

      checkStatus();
    } catch (error) {
      console.error("Error:", error.message);
      alert(error.message); // Show error message
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Virtual Try-On</h1>

      {/* Model Upload */}
      <div>
        <h3>Upload Model Image</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "model")}
        />
        {imagePreview.model && (
          <img src={imagePreview.model} alt="Model Preview" width="150" />
        )}
      </div>

      {/* Garment Upload */}
      <div>
        <h3>Upload Garment Image</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "garment")}
        />
        {imagePreview.garment && (
          <img src={imagePreview.garment} alt="Garment Preview" width="150" />
        )}
      </div>

      {/* Category Selection */}
      <div>
        <h3>Select Clothing Category</h3>
        <label>
          <input
            type="radio"
            name="category"
            value="tops"
            checked={category === "tops"}
            onChange={() => setCategory("tops")}
          />
          Tops
        </label>
        <label style={{ marginLeft: "10px" }}>
          <input
            type="radio"
            name="category"
            value="bottoms"
            checked={category === "bottoms"}
            onChange={() => setCategory("bottoms")}
          />
          Bottoms
        </label>
        <label style={{ marginLeft: "10px" }}>
          <input
            type="radio"
            name="category"
            value="Full body"
            checked={category === "one-pieces"}
            onChange={() => setCategory("one-pieces")}
          />
          Full Body
        </label>
      </div>

      {/* Generate Try-On Button */}
      <button
        onClick={generateTryOn}
        disabled={loading}
        style={{ marginTop: "20px", padding: "10px 20px" }}
      >
        {loading ? "Processing..." : "Try On"}
      </button>

      {/* Display Generated Image */}
      {generatedImage && (
        <div>
          <h3>Generated Try-On Result</h3>
          <img src={generatedImage} alt="Generated Try-On" width="300" />
        </div>
      )}
    </div>
  );
}

export default App;
