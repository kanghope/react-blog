import { useEffect, useState } from 'react';


function App() {

  const [name, setName] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');

  // useEffect(() => {
  //   console.log("컴포넌트가 렌더링 될 때마다 특정 작업을 수행합니다. " );
  //   console.log("name:", name );
  //   console.log("nickname:", nickname );
  // });

  useEffect(() => {
    console.log("마운트가 될때만 수행합니다." );
    console.log("name:", name );
    console.log("nickname:", nickname );
  },[]);


  useEffect(() => {
    console.log("name이라는 상태값이 변할 경우에만 수행합니다." );
    console.log("name:", name );
    console.log("nickname:", nickname );
  },[name]);

  useEffect(() => {
    console.log("뒷 정리하기" );
    console.log("updated name:", name );

    return () => {
      console.log("뒷 정리하기 - cleanup" );
       console.log( name );
    }
      
  },[name]);


  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);
  const onChangeNickname = (e: React.ChangeEvent<HTMLInputElement>) => setNickname(e.target.value);

  return (
    <div>
      <input type="text" placeholder="이름" value={name} onChange={onChangeName} />
      <input type="text" placeholder="닉네임" value={nickname} onChange={onChangeNickname} />
      <div><b>이름: {name}</b> </div>
      <div><b>닉네임: {nickname}</b> </div>
    </div>
  )
}

export default App
