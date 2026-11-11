using HRMSWebAPI.Repository;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace HRMSWebAPI.Services
{
    public class RecurringTaskHostedService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<RecurringTaskHostedService> _logger;

        public RecurringTaskHostedService(
            IServiceScopeFactory scopeFactory,
            ILogger<RecurringTaskHostedService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("RecurringTaskHostedService started.");

            // 1. Initial catch-up sweep on application startup after 5 seconds
            try
            {
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
                _logger.LogInformation("RecurringTaskHostedService executing initial startup catch-up...");
                await ProcessDueTasksAsync();
            }
            catch (OperationCanceledException)
            {
                return;
            }

            // 2. Loop targeting 12:00:00 AM Midnight daily
            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now;
                var nextMidnight = DateTime.Today.AddDays(1); // 12:00:00 AM tomorrow
                var delayUntilMidnight = nextMidnight - now;

                if (delayUntilMidnight <= TimeSpan.Zero)
                {
                    delayUntilMidnight = TimeSpan.FromSeconds(1);
                }

                _logger.LogInformation("RecurringTaskHostedService sleeping for {Hours}h {Minutes}m until next midnight execution at {NextMidnight}.",
                    (int)delayUntilMidnight.TotalHours, delayUntilMidnight.Minutes, nextMidnight);

                try
                {
                    await Task.Delay(delayUntilMidnight, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }

                if (stoppingToken.IsCancellationRequested) break;

                _logger.LogInformation("RecurringTaskHostedService triggered at 12:00 AM midnight. Processing due recurring tasks...");
                await ProcessDueTasksAsync();

                // Small buffer so we don't re-trigger in the same second
                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
            }

            _logger.LogInformation("RecurringTaskHostedService is stopping.");
        }

        private async Task ProcessDueTasksAsync()
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var repository = scope.ServiceProvider.GetRequiredService<ITaskManagerRepository>();

                int generatedCount = await repository.ProcessRecurringTasksAsync();
                if (generatedCount > 0)
                {
                    _logger.LogInformation("RecurringTaskHostedService generated {Count} recurring task instances.", generatedCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing recurring task generation in RecurringTaskHostedService.");
            }
        }
    }
}

