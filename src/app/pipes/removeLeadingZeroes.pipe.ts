import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeLeadingZeroes',
})
export class removeLeadingZeroesPipe implements PipeTransform {
  transform(numberStr: string) {
    let inputAsNumber = parseInt(numberStr);
    if (isNaN(inputAsNumber)) throw Error("Pipe input is'nt number");
    
    return inputAsNumber.toString();
  }
}
