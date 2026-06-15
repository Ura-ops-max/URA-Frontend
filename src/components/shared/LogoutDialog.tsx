// src/components/nav/LogoutDialog.tsx
import { Loader } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/api/use-auth-mutations';

interface LogoutDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const LogoutDialog = ({ isOpen, setIsOpen }: LogoutDialogProps) => {
  const { mutate, isPending } = useLogout();

  const handleLogout = () => {
    mutate(undefined, {
      onSettled: () => setIsOpen(false), // Close dialog regardless of success/error
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Confirm Logout</DialogTitle>
          <DialogDescription className="pt-2 text-gray-500">
            Are you sure you want to log out? You will need to enter your credentials again to
            access your dashboard.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex gap-2">
          <Button
            variant="ghost"
            disabled={isPending}
            onClick={() => setIsOpen(false)}
            className="flex-1 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={handleLogout}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-all"
          >
            {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutDialog;
