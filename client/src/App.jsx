import '@mantine/core/styles.css'
import { MantineProvider, Flex, Box, Stack, TextInput, Checkbox, Button, Title } from '@mantine/core'
import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { Navbar, Exercises, Gameboard, Editor } from './components'
import './App.css'
import API from './API'

function App() {
  const [logged, setLogged] = useState(false)

  return(<>
    <MantineProvider>
      <Flex h="100vh" direction={'column'}>
        <Navbar logged={logged} setLogged={setLogged}/>
        <Routes>
          <Route path="/" element={<Navigate to="/home"/>}/>
          <Route path="/home" element={<Exercises logged={logged}/>}/>
          <Route path="/play/:id" element={<Gameboard/>}/>
          <Route path="/edit/:id" element={<Editor/>}/>
          {/* <Route path="/bpmn" element={<BPMN/>}/> */}
        </Routes>
      </Flex>
    </MantineProvider>
  </>)
}

export default App