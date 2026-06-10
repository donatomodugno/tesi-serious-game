import '@mantine/core/styles.css'
import { MantineProvider, Flex, Box, Stack, TextInput, Checkbox, Button, Title } from '@mantine/core'
import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { Navbar, Exercises, Gameboard, NewGame } from './components'
import './App.css'
import API from './API'

function App() {
  return(<>
    <MantineProvider>
      <Flex h="100vh" direction={'column'}>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Navigate to="/home"/>}/>
          <Route path="/home" element={<Exercises/>}/>
          <Route path="/play/:id" element={<Gameboard/>}/>
          <Route path="/edit/:id" element={<NewGame/>}/>
          {/* <Route path="/bpmn" element={<BPMN/>}/> */}
        </Routes>
      </Flex>
    </MantineProvider>
  </>)
}

export default App