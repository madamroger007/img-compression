import { Layers } from 'lucide-react';
import Image from "next/image";

export function Footer() {
  return (
    <footer className="py-6 px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-1">
        <p className='text-slate-600 font-semibold'>Created by</p>
        <Image alt='' src={"/icon.png"} width={40} height={40} />
      </div>
    </footer>
  );
}
