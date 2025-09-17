'use client';

import { DashboardHeader } from '../common';

interface HeaderProps {
  title: string;
  description: string;
  logoSrc: string;
}

export default function Header({ title, description, logoSrc }: HeaderProps) {
  return (
    <DashboardHeader 
      title={title}
      description={description}
      logoSrc={logoSrc}
    />
  );
}
