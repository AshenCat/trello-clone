'use client'

import { useBoardStore } from '@/store/BoardStore'
import React, {useEffect} from 'react'
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd'
import Column from './Column'

function Board() {
  const [getBoard, board, setBoardState] = useBoardStore((state) => [state.getBoard, state.board, state.setBoardState])
  useEffect(() => {
    getBoard();
  }, [getBoard])


  const handleOnDragEnd = (result: DropResult) => {
    const {destination, source, type} = result;

    if (!destination) return;

    //Handle
    if (type === "column") {
      const entries = Array.from(board.columns.entries());
      const [removed] = entries.splice(source.index, 1);
      entries.splice(destination.index, 0, removed);
      const rearangedColumns = new Map(entries);
      setBoardState({
        ...board, columns: rearangedColumns
      })
      return;
    }

    const columns = Array.from(board.columns);
    const startColIndex = columns[Number(source.droppableId)]
    const finishColIndex = columns[Number(destination.droppableId)]

    const startCol: Column = {
      id: startColIndex[0],
      todos: startColIndex[1].todos
    }

    const finishCol: Column = {
      id: finishColIndex[0],
      todos: finishColIndex[1].todos
    }

    if (!startCol || !finishCol) return;
    if( source.index === destination.index && startCol === finishCol)
      return;

    const startColNewTodos = startCol.todos;
    const [todoMoved] = startColNewTodos.splice(source.index, 1);

    if (startCol.id === finishCol.id) {
      // same column task drag
      startColNewTodos.splice(destination.index, 0 ,todoMoved);
      const newCol = {
        id: startCol.id,
        todos: startColNewTodos,
      }
      const newColumns = new Map(board.columns);
      newColumns.set(startCol.id, newCol);

      setBoardState({...board, columns: newColumns});
    } else {
      //drag to different column
      const finishTodos = Array.from(finishCol.todos);
      finishTodos.splice(destination.index, 0, todoMoved);

      const newColumns = new Map(board.columns);
      const newCol = {
        id: startCol.id,
        todos: startColNewTodos,
      }

      newColumns.set(startCol.id, newCol);
      newColumns.set(finishCol.id, {
        id: finishCol.id,
        todos: finishTodos
      })

      // update db

      setBoardState({...board, columns: newColumns})
    }
  }

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId='board' direction='horizontal' type='column'>
            {(provided) => {
                return <div
                className='grid grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto'
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {Array.from(board.columns.entries())
                  .map(([id, column], index) => (
                    <Column
                      key={id}
                      id={id}
                      todos={column.todos}
                      index={index} />
                  ))}
                </div>
            }}
        </Droppable>
    </DragDropContext>
  )
}

export default Board