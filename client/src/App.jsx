import '@mantine/core/styles.css'
import { MantineProvider, Flex, Box, Stack, TextInput, Checkbox, Button, Title } from '@mantine/core'
import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { Navbar, Homepage, Gameboard, Editor, BpmnViewer, BpmnModeler, BpmnDiff, BpmnCards, Prova } from './components'
import './App.css'
import API from './API'

function App() {
  const [logged, setLogged] = useState(false)

  return(<>
    <MantineProvider>
      <Flex h="100vh" direction={'column'}>
        <Navbar logged={logged} setLogged={setLogged}/>
        <Routes>
          <Route path="*" element={<Navigate to="/home"/>}/>
          <Route path="/home" element={<Homepage logged={logged}/>}/>
          <Route path="/play/:id" element={<Gameboard logged={logged}/>}/>
          <Route path="/edit/:id" element={logged ? <Editor/> : <Navigate to="/home"/>}/>
          <Route path="/viewer" element={<BpmnViewer w="100%" h="100%"/>}/>
          <Route path="/modeler" element={<BpmnModeler/>}/>
          <Route path="/diff" element={<BpmnDiff/>}/>
          <Route path="/cards" element={<BpmnCards/>}/>
          <Route path="/moddle" element={<Prova/>}/>
        </Routes>
      </Flex>
    </MantineProvider>
  </>)
}

export default App