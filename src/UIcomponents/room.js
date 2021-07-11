import React, { useRef, useState } from 'react';
import Font from 'react-font';
import {AiOutlineRead,AiOutlineIssuesClose} from 'react-icons/ai';
import {GoSignOut} from 'react-icons/go';
import {RiSendPlaneFill} from 'react-icons/ri';

import "./room.css";

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
    // Use Yours
})

const auth = firebase.auth();
const firestore = firebase.firestore();

export default function Room(){
    
    const [user] = useAuthState(auth)

    return(
        <div>
            { user ? <ChatRoom userData={user}/> : <LobbyRoom/> }
        </div>
    );
};

function LobbyRoom(){

    const [readGuide,SetGuide] = useState(true)

    const SignIn = () =>{
        const UserSigninData = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(UserSigninData);
    }

    return(
        <div className="lobbyroom">
            { readGuide ?
                <React.Fragment>
                    <button className="SignInBTN" onClick={SignIn}><Font family="Zen Loop"><b>SignIn</b></Font></button>
                    <p className="guidelines">
                        Please follow the community guidelines<br/>
                        What is community guidelines?<br/>
                        <button className="readguidelines" onClick={()=>SetGuide(!readGuide)}><AiOutlineRead size="35" color="#6bd5ff"/></button>
                    </p>
                </React.Fragment>:
                <React.Fragment>
                    <div className="readGuidelines">
                        <h3>Community Guidelines:</h3>
                        <ul>
                            <li>you are not supposed to spam anything</li>
                            <li>You are not supposed to use any vulgar language by which a violence may create</li>
                            <li>Don't bully anyone by their colour,body shape or anything else</li>
                        </ul>
                        <p className="alertLine"><b>If anyone breaks any of the community guidelines he or she might get banned from this platform</b></p>
                        <button className="completedreading" onClick={()=>SetGuide(!readGuide)}><AiOutlineIssuesClose size="35" color="#6bd5ff"/></button>
                    </div>
                </React.Fragment>
            }
        </div>
    )
}

function ChatRoom(props){

    const user = props.userData;
    const [typing,setTyping] = useState('')
    const autoScrollToDown = useRef();
    const msgRef = firestore.collection('chats');
    const query = msgRef.orderBy('createdAt').limit(25);
    const [messages] = useCollectionData(query,{idField:'id'});
    
    const sendToDB = async (e) =>{
        e.preventDefault();
        const {uid,photoURL} = auth.currentUser;
        await msgRef.add({
            text:typing,
            createdAt:firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL
        })
        setTyping('');
        autoScrollToDown.current.scrollIntoView({behavior:'smooth'});
    }

    const SignOut = ()=>{
        auth.signOut();
    }

    return(
        <div className="ChatRoomlayout">
            <header>
                <div className="headerAlign">
                    {user && <img className="Avatar" src={user.photoURL} alt="Avatar"/>}
                    <h1 className="headerTitle"><Font family="Ubuntu">Touch</Font></h1>
                    <button className="SignOutBTN" onClick={SignOut}>
                        <GoSignOut size="35" color="rgb(255, 119, 95)"/>
                    </button>
                </div>
            </header>
            <main>
                {messages && messages.map(msg => <Message key={msg.id} messageIN={msg}/>)}
                <span ref={autoScrollToDown}></span>
            </main>
            <footer>
                <form className="formToCollect" onSubmit={sendToDB}>
                    <input
                        className="inputBox"
                        type="text"
                        value={typing}
                        onChange={(e)=>{setTyping(e.target.value)}}
                        placeholder="Type a message"
                    />
                    <button className="msgSendBTN" disabled={!typing} type="submit"><RiSendPlaneFill size={25} color="#6bd5ff"/></button>
                </form>
            </footer>
        </div>
    )
}

function Message(props){
    
    const { text, uid, photoURL } = props.messageIN;
    const messageType = uid === auth.currentUser.uid ? 'sent' : 'received';
  
    if(messageType==='sent'){
        return(
            <div className="msgsent">
                <p>{text}</p>
            </div>
        )
    } 
    else if(messageType==='received'){
        return(
            <div className="msgreceived">
                <img src={photoURL} alt="ProfilePic"/>
                <p>{text}</p>
            </div>
        )
    }
    else{
        return(
            <div className="msgerror"> 
                <p>Oops! Some unexpected problem occurred</p>
            </div>
        )
    }
}