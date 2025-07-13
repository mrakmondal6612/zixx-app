
import React from 'react';
import { TopBar } from './TopBar';
import { MainNav } from './MainNav';

export const Header = () => {
  return (
    <div className="flex left-0 right-0 top-0 z-20  sticky">
    <header className="bg-white border-b w-full flex max-w-[1540px] flex-col pb-[9px] border-[rgba(139,139,139,1)] border-solid ">
      <TopBar />
      <MainNav />
    </header>
    </div>
  );
};
