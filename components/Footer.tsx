import { Layers } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-6 px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <span className="text-slate-600">ImagePro</span>
      </div>
    </footer>
  );
}
