import { useState } from 'react'
import { Flex, Title, Button, List, ScrollArea } from '@mantine/core'
import API from '../API'

function Exercises({}) {
    const [exercises, setExercises] = useState(['es1','es2','es3'])

    return <Flex>
        <ScrollArea>
            {exercises.map(e => <Flex>
                {e}
            </Flex>)}
        </ScrollArea>
    </Flex>
}

export default Exercises