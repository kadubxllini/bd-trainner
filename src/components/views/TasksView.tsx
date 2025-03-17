
import { useMessages } from '@/context/MessageContext';
import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Theme } from '@/types';
import { useState } from 'react';

const TasksView = () => {
  const { messages, addMessage, toggleTaskStatus, deleteMessage } = useMessages();
  const [newTask, setNewTask] = useState('');
  const [filterTheme, setFilterTheme] = useState<Theme | 'Todos'>('Todos');
  
  const tasks = messages.filter(msg => msg.isTask)
    .filter(task => filterTheme === 'Todos' || task.theme === filterTheme)
    .sort((a, b) => {
      // Sort completed tasks to the bottom
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      // Then sort by timestamp (newest first)
      return b.timestamp - a.timestamp;
    });

  const handleAddTask = () => {
    if (newTask.trim()) {
      addMessage(newTask, true);
      setNewTask('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    }
  };

  const formatTaskTime = (timestamp: number) => {
    return formatRelative(new Date(timestamp), new Date(), {
      locale: ptBR,
    });
  };

  return (
    <div className="flex flex-col h-full glass-morphism rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-medium mb-4">Tarefas</h2>
        
        <div className="flex items-center gap-2 mb-4">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Adicionar nova tarefa..."
            className="bg-secondary/50 border-white/10 focus-visible:ring-primary/50"
          />
          <Button 
            onClick={handleAddTask}
            className="bg-primary/80 hover:bg-primary whitespace-nowrap"
          >
            Adicionar
          </Button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Button
            variant={filterTheme === 'Todos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterTheme('Todos')}
            className={`${
              filterTheme === 'Todos' 
                ? 'bg-primary/80 hover:bg-primary' 
                : 'glass-morphism border-white/10 hover:bg-white/10'
            }`}
          >
            Todos
          </Button>
          <Button
            variant={filterTheme === 'Trabalho' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterTheme('Trabalho')}
            className={`${
              filterTheme === 'Trabalho' 
                ? 'bg-primary/80 hover:bg-primary' 
                : 'glass-morphism border-white/10 hover:bg-white/10'
            }`}
          >
            Trabalho
          </Button>
          <Button
            variant={filterTheme === 'Saúde' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterTheme('Saúde')}
            className={`${
              filterTheme === 'Saúde' 
                ? 'bg-primary/80 hover:bg-primary' 
                : 'glass-morphism border-white/10 hover:bg-white/10'
            }`}
          >
            Saúde
          </Button>
          <Button
            variant={filterTheme === 'Pessoal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterTheme('Pessoal')}
            className={`${
              filterTheme === 'Pessoal' 
                ? 'bg-primary/80 hover:bg-primary' 
                : 'glass-morphism border-white/10 hover:bg-white/10'
            }`}
          >
            Pessoal
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              Nenhuma tarefa encontrada.<br />
              Adicione sua primeira tarefa!
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li 
                key={task.id} 
                className={`animate-scale-in p-3 rounded-lg border flex items-start gap-3 transition-all ${
                  task.isCompleted 
                    ? 'bg-secondary/30 border-white/5' 
                    : 'glass-morphism border-white/10'
                }`}
              >
                <Button
                  size="icon"
                  variant="outline"
                  className={`shrink-0 h-6 w-6 rounded-full transition-all ${
                    task.isCompleted 
                      ? 'bg-primary/20 border-primary/30' 
                      : 'glass-morphism border-white/20'
                  }`}
                  onClick={() => toggleTaskStatus(task.id)}
                >
                  {task.isCompleted && <Check className="h-3 w-3" />}
                </Button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.theme === 'Trabalho' ? 'bg-blue-500/20 text-blue-300' :
                      task.theme === 'Saúde' ? 'bg-green-500/20 text-green-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {task.theme}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatTaskTime(task.timestamp)}</span>
                  </div>
                  <p className={`break-words ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                    {task.content}
                  </p>
                </div>
                
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-transparent"
                  onClick={() => deleteMessage(task.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TasksView;
