'use client'
import Image from "next/image";
import { useState } from 'react'
import { Box, Stack, TextField, Button } from "@mui/material";


export default function Home() {
   const [messages, setMessages] = useState([{
      role: 'assistant',
      content: `Hi! I am a traveling agent. How can I assist you today?`
   }])

   const [messageTyped, setMessageTyped] = useState('');
   
   // Right now, the most important functionality over the entire project is to consider how to 
   // mimic the behavior of chatgpt, where a user types a response and the gpt helps the user resolve
   // any concerns they currently have.

   const sentMessage = async() => {
       /* step 1: clear the input field */
       setMessageTyped('');

       /* step 2: imagine a situation where the gpt is currently handling the request. */
       setMessages((messages) => [
          ...messages,
          {role: 'user', content: messageTyped},  // add the user message to the chat
          {role: 'assistant', content: ''},  // add the placeholder for the assistant's response
       ])

       /* step 3: send a message to the server */
       try {
          const response = fetch('/api/chat', {
            /* step 3.1: send a message to the server with the following three properties: 
                    (1) method: GET, POST, PUT, DELETE
                    (2) header: Content-Type: "Application/json"
                    (3) body: json.stringify([..messages, {role: 'user' content: 'messageTyped'}])
            */
            method: 'POST',
            headers: {
              'Content-Type': 'Application/json'
            },
            body: JSON.stringify([...messages, { role: 'user', content: 'messageTyped'}]),
          })
       
          if(!response.ok) {
              throw new Error("The network response is not okay!");
          }
          /* step 3.2: Once the response is obtained, we need to process it efficiently
                (1) read the response above using the method res.body.getReader()
                (2) create a decoder to decode the text response via TextDecoder
                (3) return the result properly
           */
          const reader = response.body.getReader(); 
          const decoder = new TextDecoder(); 
          
          const {done, value} = await reader.read();
          while (true) {
             if (done) {
                break;
             }
             const text = decoder.decode(value || new Uint8Array, {stream: true});
             setMessages((message) => {
                let lastMessage = messages[messages.length - 1];
                let otherMessages = messages.slice(0, messages.length - 1);
                return [
                  ...otherMessages,
                  {...lastMessage, content: lastMessage.content + text}
                ]
             })
          }
       }catch(error) {
          console.error("Error: ", error);
          setMessages((messages) => [
            ...messages,
            {role: 'user', content: "I am so sorry that I cannot help you resolve this question."}
          ])
       }
       
    }

   return (
    <Box width='100vx'
         height='100vh'
         display='flex'
         flexDirection='column'
         justifyContent='center'
         alignItems='center'>
       <Stack direction='column'
              width='500px'
              height='700px'
              border='1px solid black'
              p={2}
              spacing={3}>
          <Stack direction='column'
                 spacing={2}
                 flexGrow={1}
                 overflow='auto'
                 maxHeight='100%'>
          {
                messages.map((message, index) => (
                    <Box key={index} 
                         display='flex' 
                         justifyContent={
                           message.role === 'assistant' ? "flex-start" : "flex-end"
                         }>
                            <Box bgcolor={
                              message.role === 'assistant' ? 'primary.main' : 'secondary.main'
                            }
                            color='white'
                            borderRadius={16}
                            p={3}>
                              {message.content}
                            </Box>
                    </Box>
                ))
          }
          </Stack>

          <Stack direction = 'row' spacing = {2}>
             <TextField label="message"
                        fullWidth
                        value={messageTyped}
                        onChange={(e) => setMessageTyped(e.target.value)} />
                <Button variant='contained' onClick={sentMessage}>
                     Send
                </Button>
          </Stack>

       </Stack>
    </Box>
   )
}
