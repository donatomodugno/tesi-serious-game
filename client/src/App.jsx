import '@mantine/core/styles.css'
import { MantineProvider, Flex, Box, Stack, TextInput, Checkbox, Button, Title } from '@mantine/core'
import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { Home, Gameboard, BPMN, Navbar, BpmnModelerComponent, NewGame } from './components'
import './App.css'
import API from './API'

function GameView() {
  const SEP = 70
  return <>
    <Flex>
      <Box w={SEP+"%"}>
        <Gameboard/>
      </Box>
      <Box w={100-SEP+"%"}>
        {/* <BpmnModelerComponent/> */}
      </Box>
    </Flex>
  </>
}

function App() {
  return(<>
    <MantineProvider>
      <Flex h="100vh" direction={'column'}>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Navigate to="/home"/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/gameboard" element={<GameView/>}/>
          <Route path="/bpmn" element={<BPMN/>}/>
          <Route path="/new" element={<NewGame/>}/>
        </Routes>
      </Flex>
    </MantineProvider>
  </>)
}

export default App