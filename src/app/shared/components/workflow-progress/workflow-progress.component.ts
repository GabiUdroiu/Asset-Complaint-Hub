import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface WorkflowStage {
    status: string;
    label: string;
    icon: string;
}

@Component({
    selector: 'workflow-progress',
    imports: [CommonModule, MatIconModule],
    template: `
        <div class="workflow-container">
            <div class="workflow-track">
                @for (stage of stages; track stage.status; let i = $index) {
                    <div class="stage-wrapper">
                        <div
                            class="stage"
                            [ngClass]="getStageClass(stage.status)"
                        >
                            <mat-icon>{{ stage.icon }}</mat-icon>
                        </div>
                        <span class="stage-label" [class.label-rejected]="stage.status === 'REJECTED'">{{ stage.label }}</span>
                    </div>
                    @if (i < stages.length - 1) {
                        <div class="connector" [ngClass]="getConnectorClass(i)"></div>
                    }
                }
            </div>
        </div>
    `,
    styles: [`
        .workflow-container {
            padding: 20px 0;
        }

        .workflow-track {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0;
        }

        .stage-wrapper {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 12px;
            flex: none;
            width: 100%;
            min-height: 60px;
        }

        .stage {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background-color: var(--bg-tertiary);
            border: 2px solid #757575;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
            transition: all 0.3s ease;

            mat-icon {
                font-size: 1.2rem;
                width: 1.2rem;
                height: 1.2rem;
                line-height: 1.2rem;
            }

            &.pending {
                background-color: var(--bg-tertiary);
                border-color: #757575;
                color: var(--text-secondary);
            }

            &.current {
                background-color: #60a5fa;
                border-color: #60a5fa;
                color: white;
                box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.3);
            }

            &.completed {
                background-color: #4caf50;
                border-color: #4caf50;
                color: white;
            }

            &.completed-rejected {
                background-color: #ef5350;
                border-color: #ef5350;
                color: white;
                box-shadow: 0 0 0 4px #ef535031;

            }

            &.completed-closed {
                background-color: #757575;
                border-color: #757575;
                color: white;
                box-shadow: 0 0 0 4px #75757531;

            }
        }

        .stage-label {
            font-size: 0.75rem;
            font-weight: 600;
            color: #999999;
            text-align: left;
            line-height: 1.2;
            flex: 1;
            word-break: break-word;
            white-space: normal;

            &.label-rejected {
                font-weight: 700;
            }
        }

        .connector {
            width: 2px;
            height: 40px;
            background-color: #757575;
            margin-left: 22px;
            transition: background-color 0.3s ease;

            &.active {
                background-color: #4caf50;
            }

            &.active-final-rejected {
                background-color: #ef5350;
            }
        }
    `]
})
export class WorkflowProgressComponent {
    @Input() currentStatus: string = 'NEW';

    stages: WorkflowStage[] = [
        { status: 'NEW', label: 'New', icon: 'rate_review' },
        { status: 'IN_REVIEW', label: 'In Review', icon: 'assignment' },
        { status: 'IN_PROGRESS', label: 'In Progress', icon: 'engineering' },
        { status: 'RESOLVED', label: 'Resolved', icon: 'check_circle' },
        { status: 'CLOSED', label: 'Closed', icon: 'done_all' },
        { status: 'REJECTED', label: 'Rejected', icon: 'cancel' },
    ];

    getStageClass(status: string): string {
        const statusOrder = ['NEW', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
        const currentIndex = statusOrder.indexOf(this.currentStatus);
        const stageIndex = statusOrder.indexOf(status);

        // Terminal states always show their colors when reached or passed
        if (status === 'REJECTED' && stageIndex <= currentIndex) return 'completed-rejected';
        if (status === 'CLOSED' && stageIndex <= currentIndex && this.currentStatus !== 'REJECTED') return 'completed-closed';

        if (stageIndex < currentIndex) {
            return 'completed';
        }
        if (stageIndex === currentIndex) return 'current';
        return 'pending';
    }

    isConnectorActive(index: number): boolean {
        const statusOrder = ['NEW', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
        const currentIndex = statusOrder.indexOf(this.currentStatus);
        const nextStageIndex = index + 1;

        return nextStageIndex <= currentIndex;
    }

    getConnectorClass(index: number): string {
        if (!this.isConnectorActive(index)) return '';

        // Only color the final connector leading to REJECTED
        if (this.currentStatus === 'REJECTED' && index === 4) return 'active-final-rejected';

        return 'active';
    }
}
