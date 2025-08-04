"use strict";

class SortAlgorithms {
  constructor(settings = {}) {
    this.settings = settings;
    this.helper = new Helper(settings);
  }

  // Bubble Sort
  async bubbleSort() {
    const length = this.helper.getLength();
    
    for (let i = 0; i < length - 1; i++) {
      for (let j = 0; j < length - i - 1; j++) {
        if (await this.helper.compare(j, j + 1)) {
          await this.helper.swap(j, j + 1);
        }
      }
      // Mark the last element as sorted
      await this.helper.markSorted(length - i - 1);
    }
    
    // Mark the first element as sorted
    await this.helper.markSorted(0);
    await this.helper.celebrateCompletion();
  }

  // Selection Sort
  async selectionSort() {
    const length = this.helper.getLength();
    
    for (let i = 0; i < length; i++) {
      let minIndex = i;
      
      // Find minimum element
      for (let j = i + 1; j < length; j++) {
        await this.helper.markCurrent(minIndex);
        await this.helper.markComparing(j);
        
        if (await this.helper.compare(minIndex, j)) {
          await this.helper.unmark(minIndex);
          minIndex = j;
        }
        
        await this.helper.unmark(j);
      }
      
      // Swap minimum element with current position
      if (minIndex !== i) {
        await this.helper.markSwapping(minIndex);
        await this.helper.markSwapping(i);
        await this.helper.swap(minIndex, i);
      }
      
      // Mark as sorted
      await this.helper.markSorted(i);
    }
    
    await this.helper.celebrateCompletion();
  }

  // Insertion Sort
  async insertionSort() {
    const length = this.helper.getLength();
    
    for (let i = 1; i < length; i++) {
      const key = this.helper.getValue(i);
      let j = i - 1;
      
      await this.helper.markCurrent(i);
      
      while (j >= 0 && this.helper.getValue(j) > key) {
        await this.helper.markComparing(j);
        await this.helper.markComparing(j + 1);
        await this.helper.swap(j, j + 1);
        j--;
      }
      
      await this.helper.unmark(i);
    }
    
    // Mark all as sorted
    for (let i = 0; i < length; i++) {
      await this.helper.markSorted(i);
    }
    
    await this.helper.celebrateCompletion();
  }

  // Merge Sort
  async mergeSort() {
    await this.mergeSortHelper(0, this.helper.getLength() - 1);
    
    // Mark all as sorted
    for (let i = 0; i < this.helper.getLength(); i++) {
      await this.helper.markSorted(i);
    }
    
    await this.helper.celebrateCompletion();
  }

  async mergeSortHelper(start, end) {
    if (start < end) {
      const mid = Math.floor((start + end) / 2);
      
      await this.mergeSortHelper(start, mid);
      await this.mergeSortHelper(mid + 1, end);
      await this.merge(start, mid, end);
    }
  }

  async merge(start, mid, end) {
    const left = [];
    const right = [];
    
    // Copy data to temporary arrays
    for (let i = start; i <= mid; i++) {
      left.push(this.helper.getValue(i));
    }
    for (let i = mid + 1; i <= end; i++) {
      right.push(this.helper.getValue(i));
    }
    
    let i = 0, j = 0, k = start;
    
    // Merge the temporary arrays back
    while (i < left.length && j < right.length) {
      await this.helper.markComparing(start + i);
      await this.helper.markComparing(mid + 1 + j);
      
      if (left[i] <= right[j]) {
        await this.helper.setValue(k, left[i]);
        i++;
      } else {
        await this.helper.setValue(k, right[j]);
        j++;
      }
      k++;
    }
    
    // Copy remaining elements
    while (i < left.length) {
      await this.helper.setValue(k, left[i]);
      i++;
      k++;
    }
    
    while (j < right.length) {
      await this.helper.setValue(k, right[j]);
      j++;
      k++;
    }
  }

  // Quick Sort
  async quickSort() {
    await this.quickSortHelper(0, this.helper.getLength() - 1);
    
    // Mark all as sorted
    for (let i = 0; i < this.helper.getLength(); i++) {
      await this.helper.markSorted(i);
    }
    
    await this.helper.celebrateCompletion();
  }

  async quickSortHelper(start, end) {
    if (start < end) {
      const pivotIndex = await this.partition(start, end);
      await this.quickSortHelper(start, pivotIndex - 1);
      await this.quickSortHelper(pivotIndex + 1, end);
    }
  }

  async partition(start, end) {
    const pivot = this.helper.getValue(end);
    let i = start - 1;
    
    await this.helper.markPivot(end);
    
    for (let j = start; j < end; j++) {
      await this.helper.markComparing(j);
      
      if (this.helper.getValue(j) < pivot) {
        i++;
        if (i !== j) {
          await this.helper.markSwapping(i);
          await this.helper.swap(i, j);
        }
      }
      
      await this.helper.unmark(j);
    }
    
    await this.helper.swap(i + 1, end);
    await this.helper.unmark(end);
    
    return i + 1;
  }

  // Heap Sort
  async heapSort() {
    const length = this.helper.getLength();
    
    // Build max heap
    for (let i = Math.floor(length / 2) - 1; i >= 0; i--) {
      await this.heapify(length, i);
    }
    
    // Extract elements from heap one by one
    for (let i = length - 1; i > 0; i--) {
      await this.helper.markSwapping(0);
      await this.helper.markSwapping(i);
      await this.helper.swap(0, i);
      
      await this.helper.markSorted(i);
      await this.heapify(i, 0);
    }
    
    await this.helper.markSorted(0);
    await this.helper.celebrateCompletion();
  }

  async heapify(size, index) {
    let largest = index;
    const left = 2 * index + 1;
    const right = 2 * index + 2;
    
    if (left < size && this.helper.getValue(left) > this.helper.getValue(largest)) {
      largest = left;
    }
    
    if (right < size && this.helper.getValue(right) > this.helper.getValue(largest)) {
      largest = right;
    }
    
    if (largest !== index) {
      await this.helper.markSwapping(index);
      await this.helper.markSwapping(largest);
      await this.helper.swap(index, largest);
      await this.heapify(size, largest);
    }
  }

  // Radix Sort
  async radixSort() {
    const length = this.helper.getLength();
    const max = Math.max(...state.array);
    
    // Find the maximum number of digits
    const maxDigits = Math.floor(Math.log10(max)) + 1;
    
    for (let digit = 0; digit < maxDigits; digit++) {
      await this.countingSortByDigit(digit);
    }
    
    // Mark all as sorted
    for (let i = 0; i < length; i++) {
      await this.helper.markSorted(i);
    }
    
    await this.helper.celebrateCompletion();
  }

  async countingSortByDigit(digit) {
    const length = this.helper.getLength();
    const count = new Array(10).fill(0);
    const output = new Array(length);
    
    // Count occurrences
    for (let i = 0; i < length; i++) {
      const value = this.helper.getValue(i);
      const digitValue = Math.floor(value / Math.pow(10, digit)) % 10;
      count[digitValue]++;
    }
    
    // Calculate positions
    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }
    
    // Build output array
    for (let i = length - 1; i >= 0; i--) {
      const value = this.helper.getValue(i);
      const digitValue = Math.floor(value / Math.pow(10, digit)) % 10;
      const position = count[digitValue] - 1;
      
      output[position] = value;
      count[digitValue]--;
    }
    
    // Update the array
    for (let i = 0; i < length; i++) {
      await this.helper.setValue(i, output[i]);
    }
  }

  // Shell Sort
  async shellSort() {
    const length = this.helper.getLength();
    
    // Generate gap sequence (Knuth's sequence)
    const gaps = [];
    let gap = 1;
    while (gap < length) {
      gaps.unshift(gap);
      gap = gap * 3 + 1;
    }
    
    for (const currentGap of gaps) {
      for (let i = currentGap; i < length; i++) {
        const temp = this.helper.getValue(i);
        let j = i;
        
        await this.helper.markCurrent(i);
        
        while (j >= currentGap && this.helper.getValue(j - currentGap) > temp) {
          await this.helper.markComparing(j);
          await this.helper.markComparing(j - currentGap);
          await this.helper.setValue(j, this.helper.getValue(j - currentGap));
          j -= currentGap;
        }
        
        await this.helper.setValue(j, temp);
        await this.helper.unmark(i);
      }
    }
    
    // Mark all as sorted
    for (let i = 0; i < length; i++) {
      await this.helper.markSorted(i);
    }
    
    await this.helper.celebrateCompletion();
  }

  // Cocktail Sort (Bidirectional Bubble Sort)
  async cocktailSort() {
    const length = this.helper.getLength();
    let swapped = true;
    let start = 0;
    let end = length - 1;
    
    while (swapped) {
      swapped = false;
      
      // Forward pass
      for (let i = start; i < end; i++) {
        if (await this.helper.compare(i, i + 1)) {
          await this.helper.swap(i, i + 1);
          swapped = true;
        }
      }
      
      if (!swapped) break;
      
      swapped = false;
      end--;
      
      // Backward pass
      for (let i = end - 1; i >= start; i--) {
        if (await this.helper.compare(i, i + 1)) {
          await this.helper.swap(i, i + 1);
          swapped = true;
        }
      }
      
      start++;
    }
    
    // Mark all as sorted
    for (let i = 0; i < length; i++) {
      await this.helper.markSorted(i);
    }
    
    await this.helper.celebrateCompletion();
  }

  // Gnome Sort
  async gnomeSort() {
    const length = this.helper.getLength();
    let index = 0;
    
    while (index < length) {
      if (index === 0) {
        index++;
      } else if (await this.helper.compare(index - 1, index)) {
        await this.helper.swap(index, index - 1);
        index--;
      } else {
        index++;
      }
    }
    
    // Mark all as sorted
    for (let i = 0; i < length; i++) {
      await this.helper.markSorted(i);
    }
    
    await this.helper.celebrateCompletion();
  }

  // Comb Sort
  async combSort() {
    const length = this.helper.getLength();
    let gap = length;
    const shrink = 1.3;
    let sorted = false;
    
    while (!sorted) {
      gap = Math.floor(gap / shrink);
      if (gap <= 1) {
        gap = 1;
        sorted = true;
      }
      
      for (let i = 0; i + gap < length; i++) {
        if (await this.helper.compare(i, i + gap)) {
          await this.helper.swap(i, i + gap);
          sorted = false;
        }
      }
    }
    
    // Mark all as sorted
    for (let i = 0; i < length; i++) {
      await this.helper.markSorted(i);
    }
    
    await this.helper.celebrateCompletion();
  }

  // Cycle Sort
  async cycleSort() {
    const length = this.helper.getLength();
    
    for (let cycleStart = 0; cycleStart < length - 1; cycleStart++) {
      let item = this.helper.getValue(cycleStart);
      let pos = cycleStart;
      
      // Find position to place the item
      for (let i = cycleStart + 1; i < length; i++) {
        if (this.helper.getValue(i) < item) {
          pos++;
        }
      }
      
      if (pos === cycleStart) continue;
      
      // Skip duplicates
      while (item === this.helper.getValue(pos)) {
        pos++;
      }
      
      if (pos !== cycleStart) {
        await this.helper.markSwapping(cycleStart);
        await this.helper.markSwapping(pos);
        await this.helper.swap(cycleStart, pos);
      }
      
      // Rotate the rest of the cycle
      while (pos !== cycleStart) {
        pos = cycleStart;
        
        for (let i = cycleStart + 1; i < length; i++) {
          if (this.helper.getValue(i) < item) {
            pos++;
          }
        }
        
        while (item === this.helper.getValue(pos)) {
          pos++;
        }
        
        if (item !== this.helper.getValue(pos)) {
          await this.helper.markSwapping(cycleStart);
          await this.helper.markSwapping(pos);
          await this.helper.swap(cycleStart, pos);
        }
      }
    }
    
    // Mark all as sorted
    for (let i = 0; i < length; i++) {
      await this.helper.markSorted(i);
    }
    
    await this.helper.celebrateCompletion();
  }
}

// Export for use in other modules
window.SortAlgorithms = SortAlgorithms;