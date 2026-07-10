import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isValidating: boolean;
  providerLabel: string | undefined;
  keyInput: string;
  onKeyInputChange: (value: string) => void;
  onSave: () => void;
  validationError: string;
  hasApiKey: boolean;
  onReset: () => void;
}

export function ApiKeyDialog({
  open,
  onOpenChange,
  isValidating,
  providerLabel,
  keyInput,
  onKeyInputChange,
  onSave,
  validationError,
  hasApiKey,
  onReset,
}: ApiKeyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!isValidating}
        className="sm:max-w-md"
        onInteractOutside={(e) => {
          if (isValidating) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isValidating) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{providerLabel} API Key</DialogTitle>
        </DialogHeader>

        {isValidating ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <Spinner />
            <p className="text-sm text-muted-foreground">
              Connecting to {providerLabel}...
            </p>
          </div>
        ) : (
          <>
            <Field>
              <Input
                type="password"
                placeholder="sk-..."
                value={keyInput}
                onChange={(e) => onKeyInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSave();
                }}
              />
            </Field>

            {validationError && (
              <p
                className="text-xs text-destructive overflow-y-auto pb-2
                [&::-webkit-scrollbar]:h-1.5
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-input
                [&::-webkit-scrollbar-button]:hidden"
              >
                {validationError}
              </p>
            )}

            <div className="flex">
              <Button
                className="w-[15%]"
                disabled={!keyInput.trim()}
                onClick={onSave}
              >
                Save
              </Button>
              <Button
                variant="destructive"
                className="w-[15%] ml-auto"
                disabled={!hasApiKey}
                onClick={onReset}
              >
                Reset
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
