import React from 'react';

type IProps = {

}

export const RSvgContainer: React.FC<IProps> = ({ children }) => {


  return (<>
    <svg style={{backgroundColor:"#aaaaaa", width:"100%", height:"100%"}}>
      {children}
    </svg>
  </>);
}

