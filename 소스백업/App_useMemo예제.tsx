import { useMemo, useState } from 'react';

const getAverage = (numbers: number[]) => {
  console.log('평균값 계산중...');
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((totalValue, currentValue) => totalValue + currentValue);
  return sum / numbers.length;
}

function App() {
  const [List, setList] = useState<number[]>([]);
  const [number, setNumber] = useState<string>("");

  const onInsert = () => {
    const newList = List.concat(parseInt(number));
    setList(newList);
    setNumber('');
  }

  const average = useMemo(() => getAverage(List), [List]);  

  return (
    <div>
      <input type='text' value={number} onChange={(event) => setNumber(event.target.value)} />
      <button onClick={onInsert}>등록</button>
      <ul>{List.map((item:number, index:number) => {
            return <li key={index}>{item}</li>
        })}</ul> 
      <div>
          <b>평균 값: {average}</b>
      </div>
    </div>
    
  )
}

export default App;