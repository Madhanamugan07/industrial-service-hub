import { useMachines } from "@/hooks/useMachines";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Cog } from "lucide-react";

export default function MachinesPage() {
  const { data: machines = [], isLoading } = useMachines();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Machines</h1>
        <p className="text-sm text-muted-foreground mt-1">Machine information records (read-only)</p>
      </div>

      <div className="industrial-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Machine ID</TableHead>
              <TableHead>Machine Name</TableHead>
              <TableHead>Model Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground">Loading...</TableCell></TableRow>
            )}
            {!isLoading && machines.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10">
                  <Cog className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No machines registered</p>
                </TableCell>
              </TableRow>
            )}
            {machines.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-mono font-medium text-primary">{m.machine_id}</TableCell>
                <TableCell className="font-medium">{m.machine_name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{m.model_number}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
