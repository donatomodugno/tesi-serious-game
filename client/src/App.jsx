import '@mantine/core/styles.css'
import { MantineProvider, Flex, Box, Stack, TextInput, Checkbox, Button, Title } from '@mantine/core'
import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { Home, Gameboard, Navbar, NewGame, Exercises } from './components'
import './App.css'
import API from './API'

function App() {
  return(<>
    <MantineProvider>
      <Flex h="100vh" direction={'column'}>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Navigate to="/home"/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/gameboard" element={<Gameboard/>}/>
          {/* <Route path="/bpmn" element={<BPMN/>}/> */}
          <Route path="/new" element={<NewGame/>}/>
          <Route path="/play" element={<Exercises/>}/>
        </Routes>
      </Flex>
    </MantineProvider>
  </>)
}

export default App