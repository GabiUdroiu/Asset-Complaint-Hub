import { Component, inject } from "@angular/core";
import { map } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { AssetsService } from "../../shared/services/assets.service";
import { DataListComponent } from "../../shared/components/data-list/data-list";
import { ColumnDef, SelectOption, LoadFn } from "../../shared/components/data-list/data-list.types";
import { ExportDialogComponent } from "../../shared/components/export-dialog/export-dialog.component";
import { AssetDetailDialogComponent } from "./asset-detail-dialog/asset-detail-dialog.component";
import { Asset } from "../../shared/models";
import { ALL_MATERIAL } from "../../shared/material-base";
import { ApiService } from "../../shared/services/api.service";
import { UserService } from "../../core/services/user.service";
import { CommonModule } from "@angular/common";

@Component({
    selector: "assets-page",
    imports: [DataListComponent, ...ALL_MATERIAL, CommonModule],
    templateUrl: "./assets.html",
    styleUrls: ["./assets.scss"]
})
export class AssetsComponent {
    private assetsService = inject(AssetsService);
    private apiService = inject(ApiService);
    private dialog = inject(MatDialog);
    userService = inject(UserService);

    readonly columnDefs: ColumnDef<Asset>[] = [
        { key: "id", header: "ID", cell: (row) => `#${row.id}` },
        { key: "name", header: "Name" },
        { key: "serialNumber", header: "Serial #" },
        { key: "category", header: "Category" },
        { key: "status", header: "Status", isStatus: true },
        {
            key: "actions",
            header: "Actions",
            isActions: true,
            actions: [
                { icon: "open_in_new", tooltip: "View details", click: (row) => this.openDetail(row) },
            ]
        }
    ];

    readonly statusOptions: SelectOption[] = [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "maintenance", label: "Maintenance" }
    ];

    readonly categoryOptions: SelectOption[] = [
        { value: "hardware", label: "Hardware" },
        { value: "software", label: "Software" },
        { value: "equipment", label: "Equipment" }
    ];

    readonly loadFn: LoadFn<Asset> = (pagination, filters) => {
        const updatedFilters = {
            ...filters,
            employeeId: this.userService.isInSupportMode()
                ? undefined
                : this.userService.currentUser()?.id
        };
        return this.assetsService.getAssets(pagination, updatedFilters as any).pipe(
            map(response => ({
                items: response.data?.items ?? [],
                total: response.data?.total ?? 0
            }))
        );
    };

    openDetail(asset: Asset): void {
        this.dialog.open(AssetDetailDialogComponent, { data: asset })
            .afterClosed()
            .subscribe(result => {
                if (result?.reload) {
                    // trigger data-list reload by recreating loadFn ref — handled via signal if needed
                }
            });
    }

    formatDate(date: any): string {
        if (Array.isArray(date)) {
            const [year, month, day, hour = 0, minute = 0] = date;
            return new Date(year, month - 1, day, hour, minute).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
        }
        if (date instanceof Date) {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
        }
        return date
            ? new Date(date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
              })
            : '';
    }

    openDownloadMenu = (): void => {
        this.dialog.open(ExportDialogComponent).afterClosed().subscribe(result => {
            if (result) {
                this.downloadReport(result.format, result.scope);
            }
        });
    };

    downloadReport(format: 'pdf' | 'csv', scope: 'with-filters' | 'all'): void {
        const endpoint = format === 'pdf' ? 'reports/assets' : 'reports/assets/csv';
        const filename = `assets_report.${format}`;
        const params = scope === 'all' ? { exportAll: true } : {};

        this.apiService.getBlob(endpoint, params).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.click();
                window.URL.revokeObjectURL(url);
            },
            error: () => alert(`Failed to download ${format.toUpperCase()} report`)
        });
    }
}
