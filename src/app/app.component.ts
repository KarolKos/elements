import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {PeriodicElement} from './periodic-element';
import {debounceTime, map, Observable, of, startWith, switchMap} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {EditElementDialogComponent} from './edit-element-dialog/edit-element-dialog.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {AsyncPipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'}
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatFormFieldModule, MatInputModule, MatTableModule, AsyncPipe, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'actions'];
  dataSource$: Observable<PeriodicElement[]> = of(ELEMENT_DATA);
  filterValue: string = '';

  constructor(private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.dataSource$ = this.filterElements();
  }

  onFilterChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.filterValue = inputElement.value;
    this.dataSource$ = this.filterElements();
  }

  filterElements(): Observable<PeriodicElement[]> {
    return of(this.filterValue).pipe(
      debounceTime(2000),
      startWith(''),
      switchMap((filter) => of(ELEMENT_DATA).pipe(
        map(elements =>
          elements.filter(element =>
            Object.values(element)
              .some(val => val.toString().toLowerCase().includes(filter.toLowerCase()))
          )
        )
      )),
      map(data => data || [])
    );
  }

  editElement(element: PeriodicElement): void {
    const dialogRef = this.dialog.open(EditElementDialogComponent, {
      width: '270px',
      data: {...element}
    });

    dialogRef.afterClosed().subscribe(updatedElement => {
      if (updatedElement) {
        this.updateElementData(updatedElement);
      }
    });
  }

  updateElementData(updatedElement: PeriodicElement): void {
    ELEMENT_DATA.forEach((element, index) => {
      if (element.position === updatedElement.position) {
        ELEMENT_DATA[index] = {...updatedElement};
      }
    });
    this.dataSource$ = this.filterElements();
  }
}
