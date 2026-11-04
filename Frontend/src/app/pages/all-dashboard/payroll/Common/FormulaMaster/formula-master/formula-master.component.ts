import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { evaluate } from 'mathjs';

@Component({
  selector: 'app-formula-master',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectComponent, CommonModule,RouterLink],
  templateUrl: './formula-master.component.html',
  styleUrl: './formula-master.component.scss'
})
export class FormulaMasterComponent {
  FormulaMasterForm!: FormGroup;
  selectedInput: string = '';
  formulaType: string = 'basic';
  formula: string = '';

  buttons: string[] = [
    '9', '8', '7', '+',
    '6', '5', '4', '-',
    '3', '2', '1', '*',
    '0', '(', ')', '/'
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.FormulaMasterForm = this.fb.group({
      description: ['', Validators.required],
      basicFormula: [{ value: '', disabled: false, }],
      ctcFormula: [{ value: '', disabled: true }],
      notExceedFormula: [{ value: '', disabled: true }],
      order: [''],
      type: [''],
      formulaType: ['']
    });
  }
  
  onFormulaTypeChange(value: string) {
    this.formulaType = value;
  
    const basicControl = this.FormulaMasterForm.get('basicFormula');
    const ctcControl = this.FormulaMasterForm.get('ctcFormula');
    const notExceedControl = this.FormulaMasterForm.get('notExceedFormula');
  
    // Disable all
    basicControl?.disable();
    ctcControl?.disable();
    notExceedControl?.disable();
  
    // Add empty value visually for non-selected fields
    if (value !== 'basic') basicControl?.setValue(''); else basicControl?.enable();
    if (value !== 'ctc') ctcControl?.setValue(''); else ctcControl?.enable();
    if (value !== 'notExceed') notExceedControl?.setValue(''); else notExceedControl?.enable();
    
  }
  
  

  selectInput(inputName: string) {
    this.selectedInput = inputName;
  }

  insertValue(value: string) {
    if (this.selectedInput) {
      let current = this.FormulaMasterForm.get(this.selectedInput)?.value || '';
      this.FormulaMasterForm.get(this.selectedInput)?.setValue(current + value);
    }
  }

  calculate() {
    if (this.selectedInput) {
      let formula = this.FormulaMasterForm.get(this.selectedInput)?.value;
      try {
        let result = evaluate(formula);
        this.FormulaMasterForm.get(this.selectedInput)?.setValue(result);
      } catch {
        alert('Invalid formula');
      }
    }
  }

  handleClick(value: string): void {
    this.formula += value;
  }

  clearFormula(): void {
   
    this.formula = '';
  }

  clearAllFormula():void{
if (this.formula.length > 0) {
      this.formula = this.formula.slice(0, -1); // Removes the last character
    }
  }


  calculateResult(): void {
    try {
      const result = evaluate(this.formula);
      this.formula = result.toString();
    } catch {
      this.formula = 'Error';
      alert('Invalid formula');
    }
  }

  resetForm() {
    this.FormulaMasterForm.reset();
    this.formula = '';
    this.selectedInput = '';
  }

  onSubmit() {
    if (this.FormulaMasterForm.valid) {
      console.log('Form Submitted:', this.FormulaMasterForm.value);
    }
  }
}
