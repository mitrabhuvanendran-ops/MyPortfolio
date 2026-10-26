import cv2
import numpy as np
import torch
import torchvision.transforms as T
from torchvision.models.segmentation import deeplabv3_mobilenet_v3_large, DeepLabV3_MobileNet_V3_Large_Weights

def main():
    print("Loading DeepLabV3 model...")
    # 1. Load Pre-trained Semantic Segmentation Model
    weights = DeepLabV3_MobileNet_V3_Large_Weights.DEFAULT
    model = deeplabv3_mobilenet_v3_large(weights=weights).eval()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    model.to(device)

    # 2. Define Image Preprocessing Pipeline
    transform = T.Compose([
        T.ToPILImage(),
        T.Resize((480, 640)),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    # COCO / Pascal VOC Class Indices (Index 7: Car, Index 15: Person, Index 2: Bicycle)
    TARGET_CLASSES = {7: "Car", 15: "Person", 2: "Bicycle"}

    # 3. Open Video File
    input_video = "sample_video.mp4"
    cap = cv2.VideoCapture(input_video)

    if not cap.isOpened():
        print(f"Error: Could not open video file {input_video}")
        return

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30

    output_video = "output_segmented.mp4"
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_video, fourcc, fps, (width, height))

    print("Processing video frames...")
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        if frame_count % 30 == 0:
            print(f"Processed {frame_count} frames...")

        # Preprocess frame for the model
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        input_tensor = transform(rgb_frame).unsqueeze(0).to(device)

        # Predict Segmentation Mask
        with torch.no_grad():
            output = model(input_tensor)['out'][0]
        
        # Get class index with highest probability for each pixel
        mask = output.argmax(0).cpu().numpy()
        mask_resized = cv2.resize(mask.astype(np.uint8), (width, height), interpolation=cv2.INTER_NEAREST)

        # 4. Extract Objects and Draw Bounding Boxes
        for class_id, class_name in TARGET_CLASSES.items():
            class_mask = (mask_resized == class_id).astype(np.uint8) * 255
            
            # Find contours around pixel clusters of the class
            contours, _ = cv2.findContours(class_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            for cnt in contours:
                # Filter out minor noise
                if cv2.contourArea(cnt) > 800:
                    x, y, w, h = cv2.boundingRect(cnt)
                    
                    # Draw Bounding Box & Class Label
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                    cv2.putText(frame, class_name, (x, y - 10), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        out.write(frame)

    cap.release()
    out.release()
    print(f"Done! Processed {frame_count} frames. Output saved to {output_video}")

if __name__ == "__main__":
    main()