// import "./ChatWindow.css";
// import Chat from "./Chat.jsx";
// import { MyContext } from "./MyContext.jsx";
// import { useContext, useState, useEffect } from "react";
// import {ScaleLoader} from "react-spinners";

// function ChatWindow() {
//     const {prompt, setPrompt, reply, setReply, currThreadId, prevChats, setPrevChats, setNewChat} = useContext(MyContext);
//     const [loading, setLoading] = useState(false);
//     const [isOpen, setIsOpen] = useState(false);

//     const getReply = async () => {
//         setLoading(true);
//         setNewChat(false);
//         const options = {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify ({
//                 message: prompt,
//                 threadId: currThreadId
//             })
//         };
//         try {
//             const response = await fetch("http://localhost:8080/api/chat", options);
//             const res = await response.json();
//             console.log(res);
//              setReply(res.reply);
//         } catch(err){
//             console.log(err);
//         }
//          setLoading(false);

//     }

//     // Append new chat to prevchates
//      useEffect(() => {
//         if(prompt && reply) {
//             setPrevChats(prevChats => (
//                 [...prevChats, {
//                     role: "user",
//                     content: prompt
//                 },{
//                     role: "assistant",
//                     content: reply
//                 }]
//             ));
//         }

//         setPrompt("");
//     }, [reply]);

//     const handleProfileClick = () => {
//         setIsOpen(!isOpen);
//     }


//     return(
//         <div className="chatWindow">
//             <div className="navbar">
//                 <span>Nexora AI <i className="fa-solid fa-chevron-down"></i></span>
//                 <div className="userIconDiv" onClick={handleProfileClick}>
//                     <span className="userIcon"><i className="fa-solid fa-user"></i></span>
//                 </div>
//             </div>

//             {
//                 isOpen && 
//                 <div className="dropDown">
//                     <div className="dropDownItem"><i class="fa-solid fa-gear"></i> Settings</div>
//                     <div className="dropDownItem"><i class="fa-solid fa-cloud-arrow-up"></i> Upgrade plan</div>
//                     <div className="dropDownItem"><i class="fa-solid fa-arrow-right-from-bracket"></i> Log out</div>
//                 </div>
//             }

//             <Chat></Chat>

//              <ScaleLoader color="#fff" loading={loading}>
//             </ScaleLoader>

//             <div className="chatInput">
//                <div className="inputBox"> 
//                     <input placeholder="Ask anything" 
//                         value = {prompt}
//                         onChange={(e) => setPrompt(e.target.value)}
//                          onKeyDown={(e) => e.key === 'Enter'? getReply() : ''}
//                     >

//                     </input>
//                     <div id="submit" onClick={getReply}><i className = "fa-solid fa-paper-plane"></i></div>
//                 </div> 
//               <p className="info">
//                 Nexora AI can make mistakes. check important info.
//               </p>

//             </div>
//         </div>
//     )
    
// }

// export default ChatWindow;


// dfnkjnkadsjfjfjsfas




import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useRef, useState } from "react";


function ChatWindow({ onMenuClick }) {
    const {
        prompt,
        setPrompt,
        setReply,
        currThreadId,
        setPrevChats,
        setNewChat
    } = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const [imageMode, setImageMode] = useState(false);
    const [generatedImage, setGeneratedImage] = useState("");
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedVideo, setSelectedVideo] = useState("");
    const [error, setError] = useState("");

    const cameraRef = useRef(null);
    const videoRef = useRef(null);
    const requestInProgressRef = useRef(false);

    // Normal text chat
    const getReply = async () => {
        const userMessage = prompt.trim();

        if (!userMessage || requestInProgressRef.current) return;

        requestInProgressRef.current = true;
        setLoading(true);
        setError("");
        setNewChat(false);
        setShowPlusMenu(false);

        // Clear submitted prompt immediately so the user can type
        // the next prompt while the current reply is generating.
        setPrompt("");

        try {
            const response = await fetch(
                "http://localhost:8080/api/chat",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        message: userMessage,
                        threadId: currThreadId
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Chat request failed.");
            }

            // Update history using the submitted prompt,
            // not the text being typed for the next message.
            setPrevChats(previous => [
                ...previous,
                { role: "user", content: userMessage },
                { role: "assistant", content: data.reply }
            ]);

            setReply(data.reply);
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            requestInProgressRef.current = false;
            setLoading(false);
        }
    };

    // Generate image using the existing backend API
    const generateImage = async () => {
        const imagePrompt = prompt.trim();

        if (!imagePrompt || requestInProgressRef.current) return;

        requestInProgressRef.current = true;
        setLoading(true);
        setError("");
        setShowPlusMenu(false);

        // Keep the input available for the next prompt.
        setPrompt("");

        try {
            const response = await fetch(
                "http://localhost:8080/api/image",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        prompt: imagePrompt
                    })
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(
                    data.error || "Image generation failed."
                );
            }

            const blob = await response.blob();

            if (!blob.type.startsWith("image/")) {
                throw new Error("The server did not return an image.");
            }

            setGeneratedImage(previous => {
                if (previous) URL.revokeObjectURL(previous);
                return URL.createObjectURL(blob);
            });

            setImageMode(false);
        } catch (err) {
            setError(err.message || "Unable to generate image.");
        } finally {
            requestInProgressRef.current = false;
            setLoading(false);
        }
    };

    // Select an image from camera
    const handleImageSelect = event => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image.");
            event.target.value = "";
            return;
        }

        setError("");

        setSelectedImage(previous => {
            if (previous) URL.revokeObjectURL(previous);
            return URL.createObjectURL(file);
        });

        setShowPlusMenu(false);
        setImageMode(false);
        event.target.value = "";
    };

    // Select a video from the device
    const handleVideoSelect = event => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("video/")) {
            setError("Please select a valid video.");
            event.target.value = "";
            return;
        }

        setError("");

        setSelectedVideo(previous => {
            if (previous) URL.revokeObjectURL(previous);
            return URL.createObjectURL(file);
        });

        setShowPlusMenu(false);
        event.target.value = "";
    };

    // Enter key handling
    const handleEnter = event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            if (loading || requestInProgressRef.current) return;

            if (imageMode) {
                generateImage();
            } else {
                getReply();
            }
        }
    };

    const handleProfileClick = () => {
        setIsOpen(previous => !previous);
    };

    // Close popup when clicking outside it
    const handleChatScreenClick = event => {
        if (!event.target.closest(".nexoraPlusWrap")) {
            setShowPlusMenu(false);
        }
    };

    return (
        <div
            className="chatWindow"
            onClick={handleChatScreenClick}
        >
            {/* <div className="navbar">
                <span>
                    Nexora AI <i className="fa-solid fa-chevron-down"></i>
                </span>

                <div
                    className="userIconDiv"
                    onClick={handleProfileClick}
                >
                    <span className="userIcon">
                        <i className="fa-solid fa-user"></i>
                    </span>
                </div>
            </div> */}
            
            <div className="navbar">
                <button
                    type="button"
                    className="mobileMenuButton"
                    onClick={onMenuClick}
                    aria-label="Open sidebar"
                    title="Open sidebar"
                >
                <i className="fa-solid fa-bars"></i>
                </button>

                <span className="navbarTitle">
                    Nexora AI <i className="fa-solid fa-chevron-down"></i>
                </span>

            <div
                className="userIconDiv"
                onClick={handleProfileClick}
            >
                <span className="userIcon">
                    <i className="fa-solid fa-user"></i>
                </span>
            </div>
        </div>


            {isOpen && (
                <div className="dropDown">
                    <div className="dropDownItem">
                        <i className="fa-solid fa-gear"></i> Settings
                    </div>

                    <div className="dropDownItem">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        Upgrade plan
                    </div>

                    <div className="dropDownItem">
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        Log out
                    </div>
                </div>
            )}

            <Chat />

            {/* Generated image */}
            {generatedImage && (
                <div className="nexoraGeneratedImage">
                    <img src={generatedImage} alt="AI generated" />

                    <button
                        type="button"
                        aria-label="Remove generated image"
                        onClick={() => {
                            URL.revokeObjectURL(generatedImage);
                            setGeneratedImage("");
                        }}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            )}

            {/* Selected image */}
            {selectedImage && (
                <div className="nexoraImagePreview">
                    <img src={selectedImage} alt="Selected image" />

                    <button
                        type="button"
                        aria-label="Remove selected image"
                        onClick={() => {
                            URL.revokeObjectURL(selectedImage);
                            setSelectedImage("");
                        }}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            )}

            {/* Selected video */}
            {selectedVideo && (
                <div className="nexoraImagePreview">
                    <video
                        src={selectedVideo}
                        controls
                        style={{
                            display: "block",
                            width: "100%",
                            maxWidth: "100%",
                            maxHeight: "220px",
                            objectFit: "contain"
                        }}
                    />

                    <button
                        type="button"
                        aria-label="Remove selected video"
                        onClick={() => {
                            URL.revokeObjectURL(selectedVideo);
                            setSelectedVideo("");
                        }}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            )}

            {error && (
                <p className="nexoraError">{error}</p>
            )}

            {/* No separate Thinking loader here.
                Loading status is shown by the send button. */}

            <div className="chatInput">
                <div className="inputBox">

                    {/* Plus button and popup */}
                    <div
                        className="nexoraPlusWrap"
                        onClick={event => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="nexoraPlusButton"
                            title="More options"
                            aria-label="More options"
                            aria-expanded={showPlusMenu}
                            onClick={() => {
                                setShowPlusMenu(previous => !previous);
                            }}
                        >
                            <i className="fa-solid fa-plus"></i>
                        </button>

                        {showPlusMenu && (
                            <div className="nexoraPlusMenu">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageMode(true);
                                        setShowPlusMenu(false);
                                        setError("");
                                    }}
                                >
                                    <i className="fa-solid fa-image"></i>
                                    <span>
                                        <strong>Image</strong>
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => cameraRef.current?.click()}
                                >
                                    <i className="fa-solid fa-camera"></i>
                                    <span>
                                        <strong>Camera</strong>
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => videoRef.current?.click()}
                                >
                                    <i className="fa-solid fa-video"></i>
                                    <span>
                                        <strong>Video</strong>
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Hidden camera input */}
                    <input
                        ref={cameraRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        hidden
                        onChange={handleImageSelect}
                    />

                    {/* Hidden video input */}
                    <input
                        ref={videoRef}
                        type="file"
                        accept="video/*"
                        hidden
                        onChange={handleVideoSelect}
                    />

                    {/* Input stays enabled during generation */}
                    <input
                        type="text"
                        placeholder={
                            imageMode
                                ? "Describe the image you want..."
                                : "Ask anything..."
                        }
                        value={prompt}
                        onChange={event => setPrompt(event.target.value)}
                        onKeyDown={handleEnter}
                    />

                    {imageMode && (
                        <button
                            type="button"
                            className="nexoraCancelMode"
                            title="Cancel image mode"
                            onClick={() => setImageMode(false)}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    )}

                    {/* Blue circle with white rectangle while loading */}
                    <button
                        type="button"
                        id="submit"
                        className={loading ? "sending" : ""}
                        onClick={imageMode ? generateImage : getReply}
                        disabled={
                            loading ||
                            requestInProgressRef.current ||
                            !prompt.trim()
                        }
                        title={loading ? "Please wait..." : "Send message"}
                    >
                        {loading ? (
                            <span className="stopRectangle"></span>
                        ) : (
                            <i
                                className={
                                    imageMode
                                        ? "fa-solid fa-wand-magic-sparkles"
                                        : "fa-solid fa-paper-plane"
                                }
                            ></i>
                        )}
                    </button>
                </div>

                <p className="info">
                    Nexora AI can make mistakes. Check important info.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;
