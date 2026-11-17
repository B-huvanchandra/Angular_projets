
import { Component, OnInit, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employees.html',
  styleUrl: './employees.css'
})
export class Employees implements OnInit {

  searchText = signal('');
  employees = signal<Employee[]>([]);
  showForm = signal(false);
  isEditMode = signal(false);

  selectedEmployeeId: number | null = null;

  employeeForm: any;

  searchEmployees(): Employee[] {

  const search = this.searchText().toLowerCase().trim();

  return this.employees().filter(employee =>
    employee.name.toLowerCase().includes(search) ||
    employee.email.toLowerCase().includes(search) ||
    employee.role.toLowerCase().includes(search)
  );

}

  constructor(
    private employeeService: EmployeeService,
    private fb: FormBuilder
  ) {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      role: ['', Validators.required],
      salary: [0, [Validators.required, Validators.min(1)]],
      joiningDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data: Employee[]) => {
        this.employees.set(data);
      },
      error: (error: any) => {
        console.error('Loading error:', error);
      }
    });
  }

  openAddForm(): void {
    this.isEditMode.set(false);
    this.selectedEmployeeId = null;

    this.employeeForm.reset();
    this.showForm.set(true);
  }

  editEmployee(employee: Employee): void {
    this.isEditMode.set(true);
    this.selectedEmployeeId = employee.id;

    this.employeeForm.patchValue({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      salary: employee.salary,
      joiningDate: employee.joiningDate
    });

    this.showForm.set(true);
  }

  saveEmployee(): void {

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const employeeData = {
      name: this.employeeForm.value.name,
      email: this.employeeForm.value.email,
      phone: this.employeeForm.value.phone,
      role: this.employeeForm.value.role,
      salary: Number(this.employeeForm.value.salary),
      joiningDate: this.employeeForm.value.joiningDate
    };

    if (this.isEditMode() && this.selectedEmployeeId !== null) {

      this.employeeService.updateEmployee(
        this.selectedEmployeeId,
        employeeData
      ).subscribe({
        next: () => {
          alert('Employee updated successfully!');

          this.closeForm();
          this.loadEmployees();
        },
        error: (error: any) => {
          console.error('Update error:', error);
          alert('Unable to update employee.');
        }
      });

    } else {

      this.employeeService.addEmployee(employeeData).subscribe({
        next: () => {
          alert('Employee added successfully!');

          this.closeForm();
          this.loadEmployees();
        },
        error: (error: any) => {
          console.error('Add error:', error);
          alert('Unable to add employee.');
        }
      });

    }
  }

  deleteEmployee(id: number): void {

    const confirmDelete = confirm(
      'Are you sure you want to delete this employee?'
    );

    if (!confirmDelete) {
      return;
    }

    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        alert('Employee deleted successfully!');
        this.loadEmployees();
      },
      error: (error: any) => {
        console.error('Delete error:', error);
        alert('Unable to delete employee.');
      }
    });
  }

  closeForm(): void {
    this.employeeForm.reset();
    this.showForm.set(false);
    this.isEditMode.set(false);
    this.selectedEmployeeId = null;
  }

}
