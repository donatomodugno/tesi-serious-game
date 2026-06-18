import ReactBpmn from 'react-bpmn'

function BpmnViewer(props) {

  function onShown() {
    console.log('diagram shown')
  }

  function onLoading() {
    console.log('diagram loading')
  }

  function onError(err) {
    console.log('failed to show diagram')
  }

  return <ReactBpmn
		// url="prova1.bpmn"
		url="../src/assets/empty.bpmn"
		onShown={onShown}
		onLoading={onLoading}
		onError={onError}
	/>
}

export default BpmnViewer