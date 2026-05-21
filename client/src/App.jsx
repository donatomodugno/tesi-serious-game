import '@mantine/core/styles.css'
import { MantineProvider, Flex, Box, Stack, TextInput, Checkbox, Button, Title } from '@mantine/core'
import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { Gameboard, BPMN, Navbar, BpmnModelerComponent } from './components'
import './App.css'
import API from './API'

function App() {
  const SEP = 70
  return(<>
    <MantineProvider>
      <Flex h="100vh" direction={'column'}>
        <Navbar/>
        <Flex>
          <Box w={SEP+"%"}>
            <Gameboard/>
          </Box>
          <Box w={100-SEP+"%"}>
            {/* <BpmnModelerComponent/> */}
          </Box>
        </Flex>
      </Flex>
      {/* <Routes>
        <Route path="/" render={() => <Navigate to="/gameboard"/>}/>
        <Route path="/bpmn" element={<BPMN/>}/>
        <Route path="/gameboard" element={<Gameboard/>}/>
        <Route path="/modeler" element={<BpmnModelerComponent/>}/>
      </Routes> */}
    </MantineProvider>
  </>)
}

export default App