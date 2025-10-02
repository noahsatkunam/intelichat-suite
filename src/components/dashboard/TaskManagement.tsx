import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Brain,
  Calendar,
  Filter,
  MoreHorizontal,
  Edit2,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { taskService, Task } from '@/services/taskService';
import { useToast } from '@/hooks/use-toast';

const priorityConfig = {
  high: { color: 'bg-destructive text-destructive-foreground', icon: AlertTriangle },
  medium: { color: 'bg-warning text-warning-foreground', icon: Clock },
  low: { color: 'bg-muted text-muted-foreground', icon: Circle },
};

const categoryConfig = {
  'follow-up': { label: 'Follow-up', color: 'bg-primary/10 text-primary' },
  'action-item': { label: 'Action Item', color: 'bg-success/10 text-success' },
  'reminder': { label: 'Reminder', color: 'bg-warning/10 text-warning' },
  'insight': { label: 'Insight', color: 'bg-accent text-accent-foreground' },
};

interface TaskManagementProps {
  className?: string;
}

export function TaskManagement({ className }: TaskManagementProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    category: 'action-item' as Task['category'],
    due_date: ''
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
    return true;
  });

  const todayTasks = tasks.filter(task => {
    const today = new Date().toISOString().split('T')[0];
    return task.due_date === today && !task.completed;
  });

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const success = await taskService.toggleTask(taskId, !task.completed);
    if (success) {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));
      toast({
        title: 'Success',
        description: `Task marked as ${!task.completed ? 'completed' : 'pending'}`,
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    const success = await taskService.deleteTask(taskId);
    if (success) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
    }
  };

  const addTask = async () => {
    try {
      const task = await taskService.createTask({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        category: newTask.category,
        due_date: newTask.due_date || undefined,
        completed: false,
        ai_generated: false,
      });
      
      if (task) {
        setTasks(prev => [task, ...prev]);
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          category: 'action-item',
          due_date: ''
        });
        setIsAddDialogOpen(false);
        toast({
          title: 'Success',
          description: 'Task created successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    }
  };

  const renderTask = (task: Task) => {
    const PriorityIcon = priorityConfig[task.priority].icon;
    
    return (
      <div 
        key={task.id}
        className={`flex items-start gap-3 p-4 rounded-lg border transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.15)] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.05)] ${
          task.completed ? 'opacity-60 bg-muted/30' : 'bg-card hover:bg-accent/5'
        }`}
      >
        <button
          onClick={() => toggleTask(task.id)}
          className="mt-1 hover:scale-110 transition-transform"
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => deleteTask(task.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <Badge 
              variant="secondary" 
              className={`text-xs ${categoryConfig[task.category].color}`}
            >
              {categoryConfig[task.category].label}
            </Badge>
            
            <Badge 
              variant="secondary"
              className={`text-xs ${priorityConfig[task.priority].color}`}
            >
              <PriorityIcon className="w-3 h-3 mr-1" />
              {task.priority}
            </Badge>
            
            {task.ai_generated && (
              <Badge variant="outline" className="text-xs">
                <Brain className="w-3 h-3 mr-1" />
                AI Generated
              </Badge>
            )}
            
            {task.due_date && (
              <Badge variant="outline" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(task.due_date).toLocaleDateString()}
              </Badge>
            )}
          </div>
          
          {task.source && (
            <p className="text-xs text-muted-foreground mt-1">From: {task.source}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={`${className} transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)]`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">AI Task Management</CardTitle>
            <CardDescription>
              Intelligent task tracking with AI-powered insights
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary hover:shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your list. AI-generated tasks appear automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Priority</Label>
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as Task['priority'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Select value={newTask.category} onValueChange={(value) => setNewTask(prev => ({ ...prev, category: value as Task['category'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="action-item">Action Item</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                        <SelectItem value="insight">Insight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addTask} disabled={!newTask.title.trim()}>
                  Create Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Priority Tasks */}
        {todayTasks.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              Today's Priority Tasks
            </h3>
            <div className="space-y-2">
              {todayTasks.map(renderTask)}
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-2">
            {['all', 'pending', 'completed'].map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f as typeof filter)}
                className="h-7 text-xs"
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-auto h-7 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="follow-up">Follow-ups</SelectItem>
              <SelectItem value="action-item">Action Items</SelectItem>
              <SelectItem value="reminder">Reminders</SelectItem>
              <SelectItem value="insight">Insights</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Task List */}
        <div className="space-y-2 max-h-96 overflow-y-auto chat-scroll">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
              <p className="text-sm">Loading tasks...</p>
            </div>
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map(renderTask)
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tasks found</p>
              <p className="text-xs">Add tasks manually or let AI generate them from conversations</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
