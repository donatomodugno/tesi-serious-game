import '@mantine/core/styles.css'
import { MantineProvider, Flex, Box, Stack, TextInput, Checkbox, Button, Title } from '@mantine/core'
import { useState } from 'react'
import { Routes, Route } from 'react-router'
import { Gameboard, BPMN, Navbar, BpmnModelerComponent } from './components'
import './App.css'
import API from './API'

function App() {
  return(<>
    <MantineProvider>
      {/* Ci riprovo */}
      <Flex h="100vh" direction={'column'}>
        <Navbar/>
        <Flex>
          <Box w="50%">
            <Gameboard/>
          </Box>
          <Box w="50%">
            <BpmnModelerComponent/>
          </Box>
        </Flex>
      </Flex>

      {/* Fatto da Gemini */}
      {/* <Navbar/>
      <Flex h="100vh">
        <Box 
          w="50%" 
          p="md" 
          style={{ borderRight: '1px solid #eee', overflowY: 'auto' }}
        >
          <Title order={3}>Your deck</Title>
        </Box>
        <Box 
          w="50%" 
          bg="gray.0" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Title c="dimmed">Area Viewport (Anteprima)</Title>
        </Box>
      </Flex> */}
      {/* Fatto da me */}
      {/* <Flex h="100vh">
        <div style={{"backgroundColor":"green"}}>A</div>
        <div style={{"backgroundColor":"red"}}>B</div>
      </Flex> */}
      {/* <Routes>
        <Route path="/bpmn" element={<BPMN/>}/>
        <Route path="/gameboard" element={<Gameboard/>}/>
        <Route path="/modeler" element={<BpmnModelerComponent/>}/>
      </Routes> */}
    </MantineProvider>
  </>)
}

export default App