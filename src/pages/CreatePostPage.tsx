import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreatePostModal } from "../components/post/CreatePostModal";

export function CreatePostPage() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    navigate("/feed"); // Or wherever the user should go
  };

  const handlePostCreated = () => {
    setIsOpen(false);
    navigate("/feed");
  };

  return (
    <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <CreatePostModal 
        isOpen={isOpen} 
        onClose={handleClose} 
        onPostCreated={handlePostCreated} 
      />
    </div>
  );
}
