// import './App.css';
// import Sidebar from "./Sidebar.jsx";
// import ChatWindow from "./ChatWindow";
// import { MyContext } from './MyContext.jsx';
// import { useState } from 'react';
// import {v1 as uuidv1} from "uuid";

// function App() {
//   const [prompt, setPrompt] = useState("");
//   const [reply, setReply] = useState(null);
//   const [currThreadId, setCurrThreadId] = useState(uuidv1());
//   const [prevChats, setPrevChats] = useState([]); //stores all chats of curr threads
//   const [newChat, setNewChat] = useState(true);
//   const [allThreads, setAllThreads] = useState([]);



//   const providerValues = {
//     prompt, setPrompt,
//     reply, setReply,
//     currThreadId, setCurrThreadId,
//     newChat, setNewChat,
//     prevChats, setPrevChats,
//     allThreads, setAllThreads
//   }; 
  

//   return (
//     <div className='main'>
//       <MyContext.Provider value={providerValues}>
//         <Sidebar></Sidebar>
//         <ChatWindow> </ChatWindow>
//       </MyContext.Provider>
      
//     </div>
//   )
// }

// export default App



import './App.css';
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow";
import { MyContext } from './MyContext.jsx';
import { useState } from 'react';
import { v1 as uuidv1 } from "uuid";

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setAllThreads
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <MyContext.Provider value={providerValues}>
      <div className="main">
        {sidebarOpen && (
          <div
            className="sidebarOverlay"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        <aside className={`sidebarContainer ${sidebarOpen ? "sidebarOpen" : ""}`}>
          <Sidebar onNavigate={closeSidebar} />
        </aside>

        <ChatWindow onMenuClick={() => setSidebarOpen(true)} />
      </div>
    </MyContext.Provider>
  );
}

export default App;
