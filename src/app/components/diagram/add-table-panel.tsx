import { type FC } from "react";
import { Panel } from "@xyflow/react";
import { Button } from "@/components/ui/button";

interface AddTablePanelProps {
  onAddTable: () => void;
}

export const AddTablePanel: FC<AddTablePanelProps> = ({ onAddTable }) => {
  return (
    <Panel position="bottom-center" className="mb-4">
      <Button
        onClick={onAddTable}
        variant="outline"
        size="sm"
        className="shadow-md"
      >
        + Add Table
      </Button>
    </Panel>
  );
};

