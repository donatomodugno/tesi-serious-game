import { Link } from 'react-router'
import { Flex, Title, Button } from '@mantine/core'

function Home({}) {
    return <Flex direction="column" h="100%" gap="xl" justify="center" align="center">
        <Title>BPMN BattleCards</Title>
        <Link to="/gameboard"><Button color="green" size="xl">Start Game</Button></Link>
        <Link to="/new"><Button color="green">Create new exercise</Button></Link>
    </Flex>
}

export default Home