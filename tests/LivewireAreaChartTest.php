<?php

namespace Asantibanez\LivewireCharts\Tests;

use Asantibanez\LivewireCharts\Charts\LivewireAreaChart;
use Livewire\Features\SupportTesting\Testable;
use Livewire\Livewire;
use PHPUnit\Framework\Attributes\Test;

class LivewireAreaChartTest extends TestCase
{
    private function buildComponent() : Testable
    {
        return Livewire::test(LivewireAreaChart::class);
    }

    #[Test]
    public function can_build_component()
    {
        //Act
        $component = $this->buildComponent();

        //Assert
        $this->assertNotNull($component);
    }
}
