import { useCallback, useMemo, useState } from 'react';

const getAverage = (numbers: number[]) => {
  console.log('평균값 계산중...');
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((totalValue, currentValue) => totalValue + currentValue);
  return sum / numbers.length;
}

function App() {

  //usecallback은 함수형 컴포넌트에서 함수를 재사용할 때 사용하는 훅입니다.usememo와 비슷한 함수입니다. 
  //주로 랜더링 성능을 최적화해야하는 상황에서 사용합니다.
  //userCallback은 첫번째 파라미터에는 생성하고 싶은 함수를 넣고, 
  //userCallback의 두번째 파라미터에는 의존성 배열을 넣습니다.
  //이 배열에는 어떤 값이 바뀌었을때 함수를 새로 생성해야하는지 명시해야 합니다.

  const [List, setList] = useState<number[]>([]);
  const [number, setNumber] = useState<string>("");

  const [SelectedList, setSelectedList] = useState<string[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>("all");

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => { 
      setNumber(event.target.value);
  },[]); //컴보넌트가 처음 랜더링 될 때만 함수를 생성한다.

  const onChangeSelect = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => { 
      setSelectedValue(event.target.value);
  },[]); //컴보넌트가 처음 랜더링 될 때만 함수를 생성한다.

  const onInsert = useCallback(() => {
    const newList = List.concat(parseInt(number));
    setList(newList);
    setNumber('');

    const selectedList = SelectedList.concat(selectedValue);
    setSelectedList(selectedList);
    //setSelectedValue('all');
    
  }, [number,List, SelectedList, selectedValue]); //number 혹은 List가 바뀌었을 때만 함수를 생성한다.

  const average = useMemo(() => getAverage(List), [List]);  

  return (
    <div>
      <input type='text' value={number} onChange={onChange} />
      <select value={selectedValue} onChange={onChangeSelect}>
        <option value="all">전체보기</option>
          <option value="it">IT 가전</option>
          <option value="fashion">패션 의류</option>
          <option value="food">식품</option>

      </select>
      <button onClick={onInsert}>등록</button>
      <ul>{List.map((item:number, index:number) => {
            return <li key={index}>{item}</li>
        })}</ul> 
      <div>
          <b>평균 값: {average}</b>
      </div>
      <ul>{SelectedList.map((item:string, index:number) => {
            return <li key={index}>{item}</li>
        })}</ul>
      <div>
          <b>선택된 카테고리: {selectedValue}</b>
      </div>
    </div>
    
  )
}

export default App;