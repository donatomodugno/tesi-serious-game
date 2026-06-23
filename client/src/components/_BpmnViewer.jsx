import ReactBpmn from 'react-bpmn'
import { Box } from '@mantine/core'

function BpmnViewer({src='prova1.bpmn', w='100%', h='100%'}) {

  const onShown = () => console.log('diagram shown')
  const onLoading = () => console.log('diagram loading')
  const onError = (err) => console.log('failed to show diagram')

  return <Box w={w} h={h}>
    <ReactBpmn
      url={src}
      // url="../src/assets/empty.bpmn"
      onShown={onShown}
      onLoading={onLoading}
      onError={onError}
    />
  </Box>
}

export default BpmnViewer