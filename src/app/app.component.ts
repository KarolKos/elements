import {Component, OnInit} from '@angular/core';
import {PeriodicElement} from './periodic-element';
import {debounceTime, map} from 'rxjs';
import {EditElementDialogComponent} from './edit-element-dialog/edit-element-dialog.component';
import {RouterOutlet} from '@angular/router';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {AsyncPipe, NgIf} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {RxState} from '@rx-angular/state';

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' }
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    AsyncPipe,
    MatButtonModule,
    NgIf
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [RxState]
})
export class AppComponent implements OnInit {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'actions'];

  constructor(
    private dialog: MatDialog,
    public state: RxState<{ elements: PeriodicElement[], filteredElements: PeriodicElement[], filterValue: string, isLoading: boolean }>
  ) {
    this.state.set({
      elements: ELEMENT_DATA,
      filteredElements: ELEMENT_DATA,
      filterValue: '',
      isLoading: false
    });
  }

  ngOnInit(): void {
    this.filterElements();
  }

  onFilterChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.state.set({ filterValue: inputElement.value });
    this.filterElements();
  }

  filterElements(): void {
    this.state.set({ isLoading: true });

    this.state.hold(
      this.state.select('filterValue').pipe(
        debounceTime(2000),
        map(filter => {
          const elements = this.state.get().elements;
          return elements.filter(element =>
            Object.values(element)
              .some(val => val.toString().toLowerCase().includes(filter.toLowerCase()))
          );
        })
      ),
      filteredElements => {
        this.state.set({ filteredElements, isLoading: false });
      }
    );
  }

  editElement(element: PeriodicElement): void {
    const dialogRef = this.dialog.open(EditElementDialogComponent, {
      width: '270px',
      data: { ...element }
    });

    dialogRef.afterClosed().subscribe(updatedElement => {
      if (updatedElement) {
        this.updateElementData(updatedElement);
      }
    });
  }
  updateElementData(updatedElement: PeriodicElement): void {
    const updatedElements = this.state.get().elements.map((el: PeriodicElement) =>
      el.position === updatedElement.position ? updatedElement : el
    );
    this.state.set({ elements: updatedElements });
    this.filterElements();
  }
}
