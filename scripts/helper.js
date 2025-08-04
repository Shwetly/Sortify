"use strict";

class Helper {
  constructor(settings = {}) {
    this.settings = settings;
    this.speed = parseFloat(document.getElementById('speed-select').value) || 1;
    this.delay = Math.max(50, 400 / this.speed);
    this.cells = [];
    this.updateCells();
  }

  // Update cell references
  updateCells() {
    this.cells = Array.from(document.querySelectorAll('.cell'));
  }

  // Mark cell as comparing
  async markComparing(index) {
    if (index < 0 || index >= this.cells.length) return;
    
    this.cells[index].classList.add('comparing');
    playSound(523.25 + (index * 10)); // Different frequency for each cell
    await wait(this.delay);
  }

  // Mark cell as swapping
  async markSwapping(index) {
    if (index < 0 || index >= this.cells.length) return;
    
    this.cells[index].classList.add('swapping');
    playSound(659.25); // Higher frequency for swaps
    await wait(this.delay);
  }

  // Mark cell as current
  async markCurrent(index) {
    if (index < 0 || index >= this.cells.length) return;
    
    this.cells[index].classList.add('current');
    playSound(493.88);
    await wait(this.delay);
  }

  // Mark cell as pivot (for quick sort)
  async markPivot(index) {
    if (index < 0 || index >= this.cells.length) return;
    
    this.cells[index].classList.add('pivot');
    playSound(554.37);
    await wait(this.delay);
  }

  // Mark cell as sorted
  async markSorted(index) {
    if (index < 0 || index >= this.cells.length) return;
    
    this.cells[index].classList.add('sorted');
    playSound(440 + (index * 5));
    await wait(this.delay / 2);
  }

  // Unmark cell
  async unmark(index) {
    if (index < 0 || index >= this.cells.length) return;
    
    this.cells[index].classList.remove('comparing', 'swapping', 'current', 'pivot');
    await wait(this.delay / 4);
  }

  // Unmark all cells
  async unmarkAll() {
    this.cells.forEach(cell => {
      cell.classList.remove('comparing', 'swapping', 'current', 'pivot');
    });
    await wait(this.delay / 4);
  }

  // Compare two elements
  async compare(index1, index2) {
    if (index1 < 0 || index1 >= this.cells.length || 
        index2 < 0 || index2 >= this.cells.length) return false;
    
    await this.markComparing(index1);
    await this.markComparing(index2);
    
    const value1 = parseInt(this.cells[index1].getAttribute('data-value'));
    const value2 = parseInt(this.cells[index2].getAttribute('data-value'));
    
    state.comparisons++;
    updateMetrics();
    
    await wait(this.delay);
    await this.unmark(index1);
    await this.unmark(index2);
    
    return value1 > value2;
  }

  // Swap two elements
  async swap(index1, index2) {
    if (index1 < 0 || index1 >= this.cells.length || 
        index2 < 0 || index2 >= this.cells.length) return;
    
    await this.markSwapping(index1);
    await this.markSwapping(index2);
    
    // Get values
    const value1 = this.cells[index1].getAttribute('data-value');
    const value2 = this.cells[index2].getAttribute('data-value');
    
    // Update DOM
    this.cells[index1].setAttribute('data-value', value2);
    this.cells[index2].setAttribute('data-value', value1);
    
    // Update heights with animation
    const maxValue = Math.max(...state.array);
    const containerHeight = 350;
    
    this.cells[index1].style.height = `${(value2 / maxValue) * containerHeight}px`;
    this.cells[index2].style.height = `${(value1 / maxValue) * containerHeight}px`;
    
    // Update array
    [state.array[index1], state.array[index2]] = [state.array[index2], state.array[index1]];
    
    state.swaps++;
    updateMetrics();
    
    await wait(this.delay);
    await this.unmark(index1);
    await this.unmark(index2);
  }

  // Set value at index
  async setValue(index, value) {
    if (index < 0 || index >= this.cells.length) return;
    
    this.cells[index].setAttribute('data-value', value);
    state.array[index] = value;
    
    const maxValue = Math.max(...state.array);
    const containerHeight = 350;
    this.cells[index].style.height = `${(value / maxValue) * containerHeight}px`;
    
    await wait(this.delay / 2);
  }

  // Get value at index
  getValue(index) {
    if (index < 0 || index >= this.cells.length) return 0;
    return parseInt(this.cells[index].getAttribute('data-value'));
  }

  // Get array length
  getLength() {
    return this.cells.length;
  }

  // Pause execution
  async pause() {
    await wait(this.delay);
  }

  // Highlight range of cells
  async highlightRange(start, end, className = 'comparing') {
    for (let i = start; i <= end; i++) {
      if (i >= 0 && i < this.cells.length) {
        this.cells[i].classList.add(className);
      }
    }
    await wait(this.delay);
  }

  // Unhighlight range of cells
  async unhighlightRange(start, end) {
    for (let i = start; i <= end; i++) {
      if (i >= 0 && i < this.cells.length) {
        this.cells[i].classList.remove('comparing', 'swapping', 'current', 'pivot');
      }
    }
    await wait(this.delay / 4);
  }

  // Animate completion
  async animateCompletion() {
    for (let i = 0; i < this.cells.length; i++) {
      await this.markSorted(i);
      await wait(50);
    }
  }

  // Shuffle array with animation
  async shuffle() {
    const length = this.cells.length;
    for (let i = length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      await this.swap(i, j);
    }
  }

  // Reverse array with animation
  async reverse() {
    const length = this.cells.length;
    for (let i = 0; i < Math.floor(length / 2); i++) {
      await this.swap(i, length - 1 - i);
    }
  }

  // Create wave effect
  async waveEffect() {
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].style.transform = 'scale(1.1)';
      await wait(50);
      this.cells[i].style.transform = 'scale(1)';
    }
  }

  // Create ripple effect
  async rippleEffect(startIndex) {
    const maxDistance = Math.max(startIndex, this.cells.length - startIndex);
    
    for (let distance = 0; distance <= maxDistance; distance++) {
      const indices = [];
      
      if (startIndex - distance >= 0) indices.push(startIndex - distance);
      if (startIndex + distance < this.cells.length) indices.push(startIndex + distance);
      
      for (const index of indices) {
        this.cells[index].style.transform = 'scale(1.2)';
        playSound(440 + distance * 20);
      }
      
      await wait(100);
      
      for (const index of indices) {
        this.cells[index].style.transform = 'scale(1)';
      }
    }
  }

  // Create explosion effect
  async explosionEffect(centerIndex) {
    const radius = 3;
    
    for (let distance = 0; distance <= radius; distance++) {
      for (let angle = 0; angle < 360; angle += 45) {
        const index = centerIndex + Math.round(distance * Math.cos(angle * Math.PI / 180));
        
        if (index >= 0 && index < this.cells.length) {
          this.cells[index].style.transform = 'scale(1.3)';
          playSound(440 + distance * 50);
        }
      }
      
      await wait(100);
      
      for (let angle = 0; angle < 360; angle += 45) {
        const index = centerIndex + Math.round(distance * Math.cos(angle * Math.PI / 180));
        
        if (index >= 0 && index < this.cells.length) {
          this.cells[index].style.transform = 'scale(1)';
        }
      }
    }
  }

  // Create sorting completion celebration
  async celebrateCompletion() {
    // Wave effect
    await this.waveEffect();
    
    // Color burst
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    for (let i = 0; i < this.cells.length; i++) {
      const color = colors[i % colors.length];
      this.cells[i].style.background = `linear-gradient(135deg, ${color}, ${color}dd)`;
      playSound(440 + i * 10);
      await wait(50);
    }
    
    // Reset to sorted color
    setTimeout(() => {
      this.cells.forEach(cell => {
        cell.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        cell.style.transform = 'scale(1)';
      });
    }, 1000);
  }

  // Update speed
  updateSpeed() {
    this.speed = parseFloat(document.getElementById('speed-select').value) || 1;
    this.delay = Math.max(50, 400 / this.speed);
  }

  // Get statistics
  getStats() {
    return {
      comparisons: state.comparisons,
      swaps: state.swaps,
      time: performance.now() - state.startTime,
      arraySize: this.cells.length
    };
  }

  // Reset all cells
  resetCells() {
    this.cells.forEach(cell => {
      cell.classList.remove('comparing', 'swapping', 'current', 'pivot', 'sorted');
      cell.style.transform = 'scale(1)';
    });
  }
}

// Export for use in other modules
window.Helper = Helper;
