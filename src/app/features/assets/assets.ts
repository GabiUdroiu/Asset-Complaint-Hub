import { Component, inject, computed, ViewChild } from '@angular/core';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AssetsService } from '../../shared/services/assets.service';
import { DataListComponent } from '../../shared/components/data-list/data-list';
import { ColumnDef, LoadFn } from '../../shared/components/data-list/data-list.types';
import { ExportDialogComponent } from '../../shared/components/export-dialog/export-dialog.component';
import { AssetDetailDialogComponent } from './asset-detail-dialog/asset-detail-dialog.component';
import { ALL_MATERIAL } from '../../shared/material-base';
import { UserService } from '../../core/services/user.service';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { CommonModule } from '@angular/common';
import { BaseListService } from '../../shared/services/base-list.service';
import {
  Asset,
  AssetStatusEnum,
  PaginatedApiResponse,
  SelectOption,
} from '../../shared/models';

@Component({
  selector: 'assets-page',
  imports: [DataListComponent, ...ALL_MATERIAL, CommonModule],
  templateUrl: './assets.html',
  styleUrls: ['./assets.scss'],
})
export class AssetsComponent extends BaseListService {
  private assetsService = inject(AssetsService);
  override userService = inject(UserService);

  @ViewChild(DataListComponent) dataList?: DataListComponent;

  readonly columnDefs = computed(() => {
    const cols: ColumnDef<Asset>[] = [
      { key: 'id', header: 'ID', cell: (row) => `#${row.id}` },
      { key: 'name', header: 'Name' },
      { key: 'serialNumber', header: 'Serial #' },
      { key: 'category', header: 'Category' },
      { key: 'status', header: 'Status', isStatus: true },
    ];

    cols.push({
      key: 'actions',
      header: 'Actions',
      isActions: true,
      actions: [
        { icon: 'open_in_new', tooltip: 'View details', click: (row: Asset) => this.openDetail(row) },
      ],
    });

    return cols;
  });

  readonly statusOptions: SelectOption[] = [
    { value: AssetStatusEnum.ACTIVE, label: 'Active' },
    { value: AssetStatusEnum.INACTIVE, label: 'Inactive' },
    { value: AssetStatusEnum.MAINTENANCE, label: 'Maintenance' },
  ];

  readonly categoryOptions: SelectOption[] = [
    { value: 'Laptop', label: 'Laptop' },
    { value: 'Desktop', label: 'Desktop' },
    { value: 'Monitor', label: 'Monitor' },
    { value: 'Phone', label: 'Phone' },
    { value: 'Tablet', label: 'Tablet' },
    { value: 'Printer', label: 'Printer' },
    { value: 'Keyboard', label: 'Keyboard' },
    { value: 'Mouse', label: 'Mouse' },
  ];

  readonly loadFn: LoadFn<Asset> = (pagination, filters) => {
    const currentUser = this.userService.currentUser();

    const updatedFilters = {
      ...filters,
      employeeId: filters?.departmentId ? undefined : currentUser?.id,
    };

    return this.assetsService.getAssets(pagination, updatedFilters).pipe(
      map((response: PaginatedApiResponse<Asset>) => ({
        items: (response.data?.items ?? []).sort((a, b) => b.id - a.id),
        total: response.data?.total ?? 0,
      }))
    );
  };

  openDetail(asset: Asset): void {
    this.dialog
      .open(AssetDetailDialogComponent, { data: asset })
      .afterClosed()
      .subscribe(
        (result: { reload?: boolean } | undefined) => {
          if (result?.reload) {
            // trigger data-list reload via parent component if needed
          }
        }
      );
  }

  openDownloadMenu = (): void => {
    this.dialog
      .open(ExportDialogComponent)
      .afterClosed()
      .subscribe(
        (result: { format: 'pdf' | 'csv'; scope: 'with-filters' | 'all' } | undefined) => {
          if (result) {
            const format = result.format;
            const scope = result.scope;
            const endpoint =
              format === 'pdf' ? 'reports/assets' : 'reports/assets/csv';
            const filename = `assets_report.${format}`;

            const currentUser = this.userService.currentUser();
            const employeeId = currentUser?.id;

            const filters = {
              search: this.dataList?.filterSearch?.() || undefined,
              status: this.dataList?.filterStatus?.() || undefined,
              category: this.dataList?.filterCategory?.() || undefined,
              employeeId: employeeId,
            };
            this.downloadReport(endpoint, filename, format, scope, filters);
          }
        }
      );
  };
}
