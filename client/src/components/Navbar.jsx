import { Flex, Button, Title } from '@mantine/core'
import { Link } from 'react-router'

function Navbar({}) {
    const buttons = [
        {path: '/gameboard', text: 'Gameboard'},
        {path: '/bpmn', text: 'BPMN'},
        {path: '/new', text: 'New game'},
    ]

    return <Flex gap="sm" style={{padding:'10px'}}>
        <Title order={2}>BPMN BattleCards</Title>
        {buttons.map((b,i) => (
            <Link to={b.path} key={i}>
                <Button color="green">{b.text}</Button>
            </Link>
        ))}
    </Flex>
}

export default Navbar