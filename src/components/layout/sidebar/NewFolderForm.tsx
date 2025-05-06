
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

const COLOR_OPTIONS = [
  '#8E9196', // Neutral Gray
  '#9b87f5', // Primary Purple
  '#F2FCE2', // Soft Green
  '#FEF7CD', // Soft Yellow
  '#FEC6A1', // Soft Orange
  '#E5DEFF', // Soft Purple
  '#FFDEE2', // Soft Pink
  '#FDE1D3', // Soft Peach
  '#D3E4FD', // Soft Blue
  '#F97316', // Bright Orange
  '#0EA5E9', // Ocean Blue
  '#D946EF', // Magenta Pink
];

interface NewFolderFormProps {
  onCreateFolder: (name: string, color: string) => Promise<void>;
  onCancel: () => void;
  initialName?: string;
  initialColor?: string;
  isEditing?: boolean;
}

export function NewFolderForm({
  onCreateFolder,
  onCancel,
  initialName = '',
  initialColor = COLOR_OPTIONS[0],
  isEditing = false
}: NewFolderFormProps) {
  const [folderName, setFolderName] = useState(initialName);
  const [folderColor, setFolderColor] = useState(initialColor);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!folderName.trim()) return;
    
    try {
      setIsSubmitting(true);
      await onCreateFolder(folderName, folderColor);
      onCancel();
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 bg-muted/40 rounded-md space-y-2">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="w-8 h-8 p-0 border-2" 
              style={{ backgroundColor: folderColor }}
            >
              <span className="sr-only">Pick a color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="grid grid-cols-6 gap-2">
              {COLOR_OPTIONS.map((color) => (
                <Button
                  key={color}
                  variant="outline"
                  className={cn(
                    "h-8 w-8 p-0 border-2",
                    folderColor === color && "ring-2 ring-primary ring-offset-2"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setFolderColor(color)}
                >
                  <span className="sr-only">{color}</span>
                  {folderColor === color && (
                    <Check className="h-4 w-4 text-black" />
                  )}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Input
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Nome da pasta"
          className="flex-1"
          autoFocus
        />
      </div>
      <div className="flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-1" />
          Cancelar
        </Button>
        <Button 
          size="sm" 
          onClick={handleSubmit}
          disabled={isSubmitting || !folderName.trim()}
        >
          {isEditing ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </div>
  );
}
